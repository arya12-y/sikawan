<?php

namespace App\Http\Controllers\Api;

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\JawabanPeserta;
use App\Models\NilaiKompetensi;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Services\AssessmentService;
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
        $peserta = DB::transaction(function () use ($request, $service, $pesertaId) {
            $peserta = PesertaAsesmen::findOrFail($pesertaId);
            abort_unless($peserta->user_id === $request->user()->id, 403);
            $service->recalculatePeserta($peserta);
            $peserta->update(['status' => 'selesai', 'waktu_selesai' => now()]);
            $peserta->refresh()->load('asesmen');

            if ($peserta->lulus) {
                Sertifikat::firstOrCreate(
                    ['user_id' => $peserta->user_id, 'asesmen_id' => $peserta->asesmen_id],
                    [
                        'nomor_sertifikat' => 'SKW-'.now()->format('Ymd').'-'.Str::upper(Str::random(6)),
                        'kompetensi_id' => $peserta->asesmen->kompetensi_id,
                        'level_id' => $peserta->asesmen->level_id,
                        'nilai_akhir' => $peserta->nilai,
                        'kategori_kompetensi' => $service->kategori((float) $peserta->nilai),
                        'tanggal_terbit' => now(),
                        'tanggal_expired' => now()->addYears(3),
                        'is_active' => true,
                    ]
                );
            }

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

    public function review(Request $request, $pesertaId)
    {
        $peserta = PesertaAsesmen::with('user', 'asesmen', 'jawabanPesertas.bankSoal')->findOrFail($pesertaId);
        abort_unless($peserta->user_id === $request->user()->id || $this->canGradeEssay($request), 403);

        return response()->json($peserta);
    }

    public function gradeEssay(Request $request, AssessmentService $service, $jawabanId)
    {
        abort_unless($this->canGradeEssay($request), 403);
        $data = $request->validate(['nilai' => ['required', 'numeric', 'min:0'], 'catatan_penguji' => ['nullable', 'string']]);
        $jawaban = JawabanPeserta::findOrFail($jawabanId);
        $jawaban->update($data + ['dinilai_oleh' => $request->user()?->id, 'dinilai_at' => now(), 'is_benar' => $data['nilai'] > 0]);
        $service->recalculatePeserta($jawaban->pesertaAsesmen);

        return response()->json($jawaban);
    }

    private function canGradeEssay(Request $request): bool
    {
        $user = $request->user();

        return $user?->hasAnyRole(['Penguji', 'Super Admin', 'Admin Diskominfo']) || $user?->can('grade essay');
    }
}
