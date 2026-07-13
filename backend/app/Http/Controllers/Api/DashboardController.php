<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\Walidata;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalWalidata = Walidata::count();
        $sertifiedUsers = Sertifikat::query()->distinct('user_id')->count('user_id');

        return response()->json([
            'totals' => [
                'opd' => Opd::count(),
                'walidata' => $totalWalidata,
                'sudah_sertifikasi' => $sertifiedUsers,
                'belum_sertifikasi' => max($totalWalidata - $sertifiedUsers, 0),
                'nilai_rata_rata' => (int) round((float) PesertaAsesmen::whereIn('status', ['selesai', 'dinilai'])->avg('nilai')),
            ],
            'level_distribution' => DB::table('walidatas')
                ->leftJoin('levels', 'levels.id', '=', 'walidatas.level_id')
                ->selectRaw("COALESCE(levels.nama, 'Belum Ada Level') as label, COUNT(*) as value")
                ->groupBy('levels.nama')
                ->orderBy('levels.urutan')
                ->get(),
            'asesmen_status' => PesertaAsesmen::query()
                ->selectRaw('status as label, COUNT(*) as value')
                ->groupBy('status')
                ->get(),
            'top_opd' => Opd::query()
                ->withCount('walidatas')
                ->orderByDesc('walidatas_count')
                ->limit(10)
                ->get()
                ->map(fn (Opd $opd) => ['label' => $opd->singkatan ?: $opd->nama, 'value' => $opd->walidatas_count]),
            'top_walidata' => Walidata::query()
                ->with('user')
                ->orderByDesc('nilai_kompetensi')
                ->limit(10)
                ->get()
                ->map(fn (Walidata $walidata) => ['label' => $walidata->user?->name ?: 'Walidata', 'value' => (float) $walidata->nilai_kompetensi]),
            'kompetensi_scores' => DB::table('nilai_kompetensis')
                ->join('kompetensis', 'kompetensis.id', '=', 'nilai_kompetensis.kompetensi_id')
                ->selectRaw('kompetensis.nama as label, ROUND(AVG(nilai_kompetensis.nilai)) as value')
                ->groupBy('kompetensis.id', 'kompetensis.nama')
                ->orderBy('kompetensis.nama')
                ->get(),
            'training_progress' => DB::table('materi_progress')
                ->selectRaw('ROUND(AVG(progress)) as value, SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed, COUNT(*) as total')
                ->first(),
            'kompetensi_map' => Opd::query()
                ->withCount('walidatas')
                ->withAvg('walidatas', 'nilai_kompetensi')
                ->orderByDesc('walidatas_count')
                ->limit(20)
                ->get()
                ->map(fn (Opd $opd) => [
                    'opd' => $opd->singkatan ?: $opd->nama,
                    'walidata' => $opd->walidatas_count,
                    'nilai' => (int) round((float) ($opd->walidatas_avg_nilai_kompetensi ?? 0)),
                ]),
        ]);
    }
}
