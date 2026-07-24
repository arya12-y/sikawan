<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asesmen;
use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\Walidata;
use App\Services\AssessmentService;
use Illuminate\Http\Request;

class WalidataFlowController extends Controller
{
    public function overview(Request $request)
    {
        $user = $request->user();
        $walidata = Walidata::with('opd', 'bidang', 'jabatan', 'level')->where('user_id', $user->id)->first();
        $asesmens = Asesmen::with('kompetensi', 'level')->whereIn('status', ['published', 'ongoing'])->latest()->get();
        $pesertas = PesertaAsesmen::with('asesmen.kompetensi', 'asesmen.level')->where('user_id', $user->id)->latest()->get();
        $materis = Materi::with('kompetensi', 'level', 'kategori')->where('is_published', true)->when($walidata?->level_id, fn ($query) => $query->where(function ($q) use ($walidata) {
            $q->whereNull('level_id')->orWhere('level_id', $walidata->level_id);
        }))->orderBy('urutan')->latest()->get();
        $sertifikats = Sertifikat::with('asesmen', 'kompetensi', 'level')->where('user_id', $user->id)->latest()->get();
        $lastPeserta = $pesertas->first();
        $recommendations = $lastPeserta && ! $lastPeserta->lulus ? $this->recommendations($lastPeserta) : collect();

        return response()->json([
            'user' => $user,
            'walidata' => $walidata,
            'asesmens' => $asesmens,
            'pesertas' => $pesertas,
            'materis' => $materis,
            'sertifikats' => $sertifikats,
            'recommendations' => $recommendations->values(),
        ]);
    }

    public function completeMateri(Request $request, $materiId)
    {
        $progress = MateriProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'materi_id' => $materiId],
            ['progress' => 100, 'is_completed' => true, 'completed_at' => now()]
        );

        return response()->json($progress->load('materi'));
    }

    public function result(Request $request, AssessmentService $service, $pesertaId)
    {
        $peserta = PesertaAsesmen::with('asesmen.kompetensi', 'asesmen.level')->where('user_id', $request->user()->id)->findOrFail($pesertaId);
        $level = $service->determineLevel((float) $peserta->nilai);
        $walidata = Walidata::where('user_id', $request->user()->id)->first();

        if ($walidata) {
            $walidata->update(['level_id' => $level?->id, 'nilai_kompetensi' => $peserta->nilai]);
        }

        $sertifikat = null;
        if ($peserta->lulus) {
            $sertifikat = Sertifikat::firstOrCreate(
                ['user_id' => $peserta->user_id, 'asesmen_id' => $peserta->asesmen_id],
                ['nomor_sertifikat' => 'SKW-'.now()->format('Ymd').'-'.strtoupper(str()->random(6)), 'kompetensi_id' => $peserta->asesmen->kompetensi_id, 'level_id' => $level?->id ?? $peserta->asesmen->level_id, 'nilai_akhir' => $peserta->nilai, 'kategori_kompetensi' => $service->kategori((float) $peserta->nilai), 'tanggal_terbit' => now(), 'tanggal_expired' => now()->addYears(3), 'is_active' => true]
            );
        }

        return response()->json([
            'peserta' => $peserta->refresh()->load('asesmen.kompetensi', 'asesmen.level'),
            'level' => $level,
            'walidata' => $walidata?->fresh('level'),
            'sertifikat' => $sertifikat?->load('kompetensi', 'level'),
            'recommendations' => $peserta->lulus ? [] : $this->recommendations($peserta)->values(),
        ]);
    }

    private function recommendations(PesertaAsesmen $peserta)
    {
        return Materi::with('kompetensi', 'level', 'kategori')
            ->where('is_published', true)
            ->where('kompetensi_id', $peserta->asesmen?->kompetensi_id)
            ->when($peserta->asesmen?->level_id, fn ($query) => $query->where(function ($q) use ($peserta) {
                $q->whereNull('level_id')->orWhere('level_id', $peserta->asesmen->level_id);
            }))
            ->orderBy('urutan')
            ->limit(5)
            ->get();
    }
}
