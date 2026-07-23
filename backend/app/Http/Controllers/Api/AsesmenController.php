<?php

namespace App\Http\Controllers\Api;

use App\Helpers\NotifikasiHelper;
use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\JawabanPeserta;
use App\Models\NilaiKompetensi;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Services\AssessmentService;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AsesmenController extends CrudController
{
    protected array $with = ['kompetensi', 'level', 'bankSoals', 'creator'];

    protected array $searchable = ['judul', 'deskripsi'];

    protected array $filterable = ['kompetensi_id', 'level_id', 'status', 'created_by'];

    protected array $sortable = ['id', 'judul', 'tanggal_mulai', 'tanggal_selesai', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return Asesmen::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['judul' => ['required', 'string'], 'deskripsi' => ['nullable', 'string'], 'kompetensi_id' => ['required', 'exists:kompetensis,id'], 'level_id' => ['nullable', 'exists:levels,id'], 'jumlah_soal' => ['required', 'integer'], 'durasi' => ['required', 'integer'], 'nilai_lulus' => ['required', 'numeric'], 'acak_soal' => ['boolean'], 'acak_jawaban' => ['boolean'], 'tanggal_mulai' => ['nullable', 'date'], 'tanggal_selesai' => ['nullable', 'date'], 'status' => ['required', Rule::in(['draft', 'published', 'ongoing', 'finished'])]];
    }

    public function store(Request $request)
    {
        $request->merge(['created_by' => $request->user()?->id]);

        return parent::store($request);
    }

    public function attachSoals(Request $request, $id)
    {
        $data = $request->validate(['soal_ids' => ['required', 'array'], 'soal_ids.*' => ['exists:bank_soals,id']]);
        $asesmen = Asesmen::findOrFail($id);
        $asesmen->bankSoals()->sync(collect($data['soal_ids'])->mapWithKeys(fn ($soalId, $i) => [$soalId => ['urutan' => $i + 1]])->all());

        return response()->json($asesmen->load('bankSoals'));
    }

    public function start(Request $request, $id)
    {
        $asesmen = Asesmen::findOrFail($id);
        abort_unless(in_array($asesmen->status, ['published', 'ongoing'], true), 422, 'Asesmen belum tersedia');
        abort_if($asesmen->tanggal_mulai && now()->lt($asesmen->tanggal_mulai), 422, 'Asesmen belum dimulai');
        abort_if($asesmen->tanggal_selesai && now()->gt($asesmen->tanggal_selesai), 422, 'Asesmen sudah selesai');

        if ($asesmen->bankSoals()->count() === 0) {
            $soals = BankSoal::query()
                ->where('kompetensi_id', $asesmen->kompetensi_id)
                ->when($asesmen->level_id, fn ($query) => $query->where('level_id', $asesmen->level_id))
                ->where('is_active', true)
                ->when($asesmen->acak_soal, fn ($query) => $query->inRandomOrder(), fn ($query) => $query->orderBy('id'))
                ->limit($asesmen->jumlah_soal)
                ->pluck('id');

            abort_if($soals->isEmpty(), 422, 'Bank soal belum tersedia untuk asesmen ini');

            $asesmen->bankSoals()->sync($soals->mapWithKeys(fn ($soalId, $i) => [$soalId => ['urutan' => $i + 1]])->all());
        }

        $existing = PesertaAsesmen::where(['asesmen_id' => $asesmen->id, 'user_id' => $request->user()->id])->first();
        abort_if($existing && in_array($existing->status, ['selesai', 'dinilai'], true), 422, 'Anda sudah mengerjakan asesmen ini sebelumnya');

        $peserta = $existing ?? PesertaAsesmen::create(['asesmen_id' => $asesmen->id, 'user_id' => $request->user()->id, 'waktu_mulai' => now(), 'status' => 'sedang_mengerjakan']);
        $peserta->load(['asesmen.bankSoals' => fn ($query) => $asesmen->acak_soal ? $query->inRandomOrder() : $query->orderBy('asesmen_soals.urutan'), 'jawabanPesertas']);

        return response()->json($peserta);
    }

    public function saveAnswer(Request $request, AssessmentService $service, $pesertaId)
    {
        $data = $request->validate(['bank_soal_id' => ['required', 'exists:bank_soals,id'], 'jawaban' => ['nullable', 'string']]);
        $peserta = PesertaAsesmen::with('asesmen.bankSoals')->findOrFail($pesertaId);
        abort_unless($peserta->user_id === $request->user()->id, 403);
        $soal = $peserta->asesmen->bankSoals->firstWhere('id', (int) $data['bank_soal_id']);
        abort_unless($soal, 422, 'Invalid soal');
        $score = $service->calculateAnswerScore($soal, $data['jawaban'] ?? null);
        $jawaban = JawabanPeserta::updateOrCreate(['peserta_asesmen_id' => $peserta->id, 'bank_soal_id' => $soal->id], ['jawaban' => $data['jawaban'] ?? null] + $score);
        $service->recalculatePeserta($peserta);

        return response()->json($jawaban);
    }

    public function submit(Request $request, AssessmentService $service, $pesertaId)
    {
        $peserta = PesertaAsesmen::findOrFail($pesertaId);
        abort_unless($peserta->user_id === $request->user()->id, 403);

        $peserta->load('asesmen.bankSoals', 'jawabanPesertas.bankSoal');

        $essayIds = collect();
        foreach ($peserta->asesmen->bankSoals as $s) {
            if ($s->jenis === 'essay') $essayIds->push($s->id);
        }

        $answeredEssayIds = collect();
        $essayKosong = collect();
        foreach ($peserta->jawabanPesertas as $j) {
            if ($j->bankSoal && $j->bankSoal->jenis === 'essay') {
                $answeredEssayIds->push($j->bank_soal_id);
                if (empty(trim($j->jawaban ?? ''))) {
                    $essayKosong->push($j);
                }
            }
        }

        $essayBelumDijawab = $essayIds->diff($answeredEssayIds);
        abort_if($essayBelumDijawab->isNotEmpty() || $essayKosong->isNotEmpty(), 422, 'Jawab semua soal essay terlebih dahulu sebelum mengumpulkan');

        $peserta = DB::transaction(function () use ($request, $service, $pesertaId) {
            $peserta = PesertaAsesmen::findOrFail($pesertaId);
            $peserta->loadMissing('asesmen.bankSoals', 'jawabanPesertas.bankSoal');
            $totalBobot = (float) $peserta->asesmen?->bankSoals->sum(fn ($soal) => (float) $soal->bobot);
            $totalNilaiPG = (float) $peserta->jawabanPesertas
                ->filter(fn ($j) => $j->bankSoal?->jenis === 'pilihan_ganda')
                ->sum(fn ($j) => (float) ($j->nilai ?? 0));
            $nilaiSementara = $totalBobot > 0 ? round(($totalNilaiPG / $totalBobot) * 100) : 0;

            $peserta->update([
                'status' => 'selesai',
                'waktu_selesai' => now(),
                'nilai' => $nilaiSementara,
                'lulus' => null,
            ]);
            $peserta->refresh()->load('asesmen');

            $this->saveCompetencyScores($peserta);

            return $peserta->refresh();
        });

        return response()->json($peserta);
    }

    private function saveCompetencyScores(PesertaAsesmen $peserta): void
    {
        $peserta->loadMissing(['jawabanPesertas.bankSoal', 'asesmen.bankSoals']);
        $grouped = $peserta->jawabanPesertas->groupBy(fn ($jp) => $jp->bankSoal?->kompetensi_id ?? $peserta->asesmen->kompetensi_id);

        foreach ($grouped as $kompetensiId => $jawabans) {
            $totalBobot = $jawabans->sum(fn ($jp) => (float) ($jp->bankSoal?->bobot ?? 1));
            $totalNilai = $jawabans->sum(fn ($jp) => (float) ($jp->nilai ?? 0));
            $nilai = $totalBobot > 0 ? round(($totalNilai / $totalBobot) * 100, 2) : 0;

            NilaiKompetensi::updateOrCreate(
                ['user_id' => $peserta->user_id, 'kompetensi_id' => $kompetensiId, 'asesmen_id' => $peserta->asesmen_id],
                ['nilai' => $nilai, 'level_id' => $peserta->asesmen->level_id, 'kategori' => $peserta->asesmen->judul]
            );
        }

        $avg = NilaiKompetensi::where('user_id', $peserta->user_id)->avg('nilai');
        \App\Models\Walidata::where('user_id', $peserta->user_id)->update(['nilai_kompetensi' => round($avg ?? 0, 2)]);
    }

    public function reset(Request $request, $pesertaId)
    {
        abort_unless($request->user()->hasAnyRole(['Super Admin', 'Admin Diskominfo']), 403);

        $peserta = PesertaAsesmen::with('asesmen')->findOrFail($pesertaId);

        $peserta->jawabanPesertas()->delete();

        \App\Models\Sertifikat::where('user_id', $peserta->user_id)
            ->where('asesmen_id', $peserta->asesmen_id)
            ->delete();

        \App\Models\Wawancara::where('peserta_asesmen_id', $peserta->id)->delete();
        \App\Models\NilaiKompetensi::where('user_id', $peserta->user_id)
            ->where('asesmen_id', $peserta->asesmen_id)
            ->delete();

        $peserta->update([
            'status' => 'belum_mulai',
            'nilai' => null,
            'lulus' => null,
            'waktu_mulai' => null,
            'waktu_selesai' => null,
            'approved_by' => null,
            'approved_at' => null,
            'catatan_approve' => null,
        ]);

        AuditLogService::log('reset', 'PesertaAsesmen', 'Reset ujian oleh '.$request->user()->name, [
            'peserta_id' => $pesertaId,
            'user_id' => $peserta->user_id,
            'asesmen' => $peserta->asesmen?->judul,
            'nilai_lama' => $peserta->nilai,
        ]);

        return response()->json(['message' => 'Ujian berhasil direset. User dapat memulai ulang.']);
    }

    public function review(Request $request, $pesertaId)
    {
        $peserta = PesertaAsesmen::with('user', 'asesmen', 'jawabanPesertas.bankSoal')->findOrFail($pesertaId);
        abort_unless($peserta->user_id === $request->user()->id || $this->canGradeEssay($request), 403);

        return response()->json($peserta);
    }

    public function daftarEssay(Request $request)
    {
        abort_unless($this->canGradeEssay($request), 403);

        $jawabans = JawabanPeserta::with([
            'bankSoal:id,pertanyaan,pembahasan,jawaban_benar',
            'pesertaAsesmen.asesmen:id,judul',
            'pesertaAsesmen.user:id,name',
        ])
            ->whereHas('bankSoal', fn ($q) => $q->where('jenis', 'essay'))
            ->whereHas('pesertaAsesmen', fn ($q) => $q->whereIn('status', ['selesai', 'dinilai']))
            ->latest()
            ->get()
            ->map(fn ($j) => [
                'id' => $j->id,
                'peserta_id' => $j->peserta_asesmen_id,
                'peserta_nama' => $j->pesertaAsesmen?->user?->name ?? '-',
                'asesmen' => $j->pesertaAsesmen?->asesmen?->judul ?? '-',
                'soal' => $j->bankSoal?->pertanyaan ?? '-',
                'jawaban' => $j->jawaban,
                'nilai' => $j->nilai,
                'catatan_penguji' => $j->catatan_penguji,
                'dinilai' => !is_null($j->dinilai_oleh),
                'lulus' => $j->pesertaAsesmen?->lulus,
                'pembahasan' => $j->bankSoal?->pembahasan,
                'jawaban_benar' => $j->bankSoal?->jawaban_benar,
                'created_at' => $j->created_at,
            ]);

        return response()->json($jawabans);
    }

    public function gradeEssay(Request $request, AssessmentService $service, $jawabanId)
    {
        abort_unless($this->canGradeEssay($request), 403);
        $data = $request->validate(['nilai' => ['required', 'numeric', 'min:0', 'max:100'], 'catatan_penguji' => ['nullable', 'string']]);
        $jawaban = JawabanPeserta::findOrFail($jawabanId);
        $jawaban->update($data + [
            'dinilai_oleh' => $request->user()?->id,
            'dinilai_at' => now(),
            'is_benar' => $data['nilai'] > 0,
        ]);
        $peserta = $service->recalculatePeserta($jawaban->pesertaAsesmen);

        $sertifikat = Sertifikat::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id);
        if ($peserta->lulus) {
            $sertifikat->firstOrCreate(
                ['user_id' => $peserta->user_id, 'asesmen_id' => $peserta->asesmen_id],
                [
                    'nomor_sertifikat' => 'SKW-'.now()->format('Ymd').'-'.\Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)),
                    'kompetensi_id' => $peserta->asesmen?->kompetensi_id,
                    'level_id' => $peserta->asesmen?->level_id,
                    'nilai_akhir' => $peserta->nilai,
                    'kategori_kompetensi' => $service->kategori((float) $peserta->nilai),
                    'tanggal_terbit' => now(),
                    'tanggal_expired' => now()->addYears(3),
                    'is_active' => true,
                ]
            );
        } else {
            $sertifikat->delete();
        }

        return response()->json($jawaban);
    }

    public function approve(Request $request, AssessmentService $service, $id)
    {
        abort_unless($this->canGradeEssay($request), 403);
        $data = $request->validate(['catatan' => ['nullable', 'string']]);
        $peserta = \App\Models\PesertaAsesmen::findOrFail($id);
        $peserta->update([
            'lulus' => true,
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
            'catatan_approve' => $data['catatan'] ?? null,
        ]);

        Sertifikat::firstOrCreate(
            ['user_id' => $peserta->user_id, 'asesmen_id' => $peserta->asesmen_id],
            [
                'nomor_sertifikat' => 'SKW-'.now()->format('Ymd').'-'.\Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)),
                'kompetensi_id' => $peserta->asesmen?->kompetensi_id,
                'level_id' => $peserta->asesmen?->level_id,
                'nilai_akhir' => $peserta->nilai,
                'kategori_kompetensi' => $service->kategori((float) $peserta->nilai),
                'tanggal_terbit' => now(),
                'tanggal_expired' => now()->addYears(3),
                'is_active' => true,
            ]
        );

        $namaAsesmen = $peserta->asesmen?->judul ?? 'Asesmen';
        NotifikasiHelper::send($peserta->user_id, 'Lulus Asesmen', "Selamat! Anda dinyatakan lulus pada asesmen \"{$namaAsesmen}\". Sertifikat telah tersedia.", 'success', '/sertifikat');

        return response()->json(['message' => 'Peserta lulus', 'peserta' => $peserta->fresh()]);
    }

    public function tolak(Request $request, $id)
    {
        abort_unless($this->canGradeEssay($request), 403);
        $data = $request->validate(['catatan' => ['nullable', 'string']]);
        $peserta = \App\Models\PesertaAsesmen::findOrFail($id);
        $peserta->update([
            'lulus' => false,
            'catatan_approve' => $data['catatan'] ?? null,
        ]);

        Sertifikat::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id)->delete();

        $namaAsesmen = $peserta->asesmen?->judul ?? 'Asesmen';
        NotifikasiHelper::send($peserta->user_id, 'Belum Lulus Asesmen', "Anda belum lulus pada asesmen \"{$namaAsesmen}\". Silakan pelajari lagi dan coba.", 'warning', '/pembelajaran');

        return response()->json(['message' => 'Peserta tidak lulus', 'peserta' => $peserta->fresh()]);
    }

    private function canGradeEssay(Request $request): bool
    {
        $user = $request->user();

        return $user?->hasAnyRole(['Penguji', 'Super Admin', 'Admin Diskominfo']) || $user?->can('grade essay');
    }
}
