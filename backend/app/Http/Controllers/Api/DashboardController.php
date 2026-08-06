<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\Walidata;
use App\Models\MateriProgress;
use App\Models\NilaiKompetensi;
use App\Models\PretestResult;
use App\Models\Materi;
use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalWalidata = Walidata::count();
        $sertifiedUsers = Sertifikat::distinct('user_id')->count('user_id');
        $lastPesertaIds = PesertaAsesmen::whereIn('status', ['selesai', 'dinilai', 'menunggu_dinilai', 'wawancara'])
            ->whereNotNull('nilai')
            ->latest('id')
            ->get()
            ->unique('user_id')
            ->pluck('id');

        return response()->json([
            'totals' => [
                'opd' => Opd::count(),
                'walidata' => $totalWalidata,
                'sudah_sertifikasi' => $sertifiedUsers,
                'belum_sertifikasi' => max($totalWalidata - $sertifiedUsers, 0),
                'nilai_rata_rata' => (int) round((float) PesertaAsesmen::whereIn('status', ['selesai', 'dinilai', 'menunggu_dinilai', 'wawancara'])->avg('nilai')),
            ],
            'level_distribution' => DB::table('walidatas')
                ->whereNull('walidatas.deleted_at')
                ->leftJoin('levels', 'levels.id', '=', 'walidatas.level_id')
                ->selectRaw("COALESCE(levels.nama, 'Belum Ada Level') as label, COUNT(*) as value, MIN(COALESCE(levels.urutan, 999)) as sort_order")
                ->groupBy('label')
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($item) => ['label' => $item->label, 'value' => $item->value]),
            'asesmen_status' => PesertaAsesmen::query()
                ->selectRaw('COALESCE(NULLIF(status, \'\'), \'belum_mulai\') as label, COUNT(*) as value')
                ->groupBy('label')
                ->get()
                ->map(fn ($item) => ['label' => $item->label === 'belum_mulai' ? 'Belum Mulai' : ucfirst($item->label), 'value' => $item->value]),
            'top_opd' => Opd::query()
                ->withCount('walidatas')
                ->orderByDesc('walidatas_count')
                ->limit(10)
                ->get()
                ->map(fn (Opd $opd) => ['label' => $opd->singkatan ?: $opd->nama, 'value' => $opd->walidatas_count]),
            'top_walidata' => PesertaAsesmen::whereIn('id', $lastPesertaIds)
                ->with('user')
                ->whereHas('user', fn ($q) => $q->whereHas('walidata'))
                ->orderByDesc('nilai')
                ->limit(10)
                ->get()
                ->map(fn (PesertaAsesmen $p) => ['label' => $p->user?->name ?: 'Walidata', 'value' => (float) $p->nilai]),
            'kompetensi_scores' => NilaiKompetensi::query()
                ->selectRaw('kompetensi_id, ROUND(AVG(nilai)) as value')
                ->with('kompetensi')
                ->groupBy('kompetensi_id')
                ->get()
                ->map(fn ($item) => [
                    'label' => $item->kompetensi?->nama ?? 'Kompetensi #'.$item->kompetensi_id,
                    'value' => (int) $item->value,
                ]),
            'walidata_stats' => function () use ($request) {
                $user = $request->user();
                if (!$user || !$user->walidata) return null;
                $walidata = $user->walidata;
                $totalMateri = Materi::where('is_published', true)->count();
                $selesaiMateri = MateriProgress::where('user_id', $user->id)->where('is_completed', true)->count();
                $pretest = PretestResult::where('user_id', $user->id)->exists();
                $level = $walidata->level;
                $nextLevel = $level ? Level::where('urutan', $level->urutan + 1)->first() : null;
                return [
                    'level_saat_ini' => $level?->nama ?? 'Belum ada level',
                    'level_berikutnya' => $nextLevel?->nama ?? '-',
                    'progress_materi' => $totalMateri > 0 ? round(($selesaiMateri / $totalMateri) * 100) : 0,
                    'pretest_selesai' => $pretest,
                    'total_sertifikat' => \App\Models\Sertifikat::where('user_id', $user->id)->count(),
                ];
            },
            'training_progress' => (function () {
                $walidataIds = \App\Models\Walidata::pluck('user_id');
                return [
                    'value' => (int) round((float) MateriProgress::whereIn('user_id', $walidataIds)->avg('progress')),
                    'completed' => MateriProgress::whereIn('user_id', $walidataIds)->where('is_completed', true)->count(),
                    'total' => MateriProgress::whereIn('user_id', $walidataIds)->count(),
                ];
            })(),
            'kompetensi_map' => DB::table('nilai_kompetensis')
                ->join('walidatas', 'walidatas.user_id', '=', 'nilai_kompetensis.user_id')
                ->join('opds', 'opds.id', '=', 'walidatas.opd_id')
                ->whereNull('walidatas.deleted_at')
                ->selectRaw('opds.id, COALESCE(opds.singkatan, opds.nama) as opd, COUNT(DISTINCT walidatas.user_id) as walidata, ROUND(AVG(nilai_kompetensis.nilai)) as nilai')
                ->groupBy('opds.id', 'opd')
                ->orderByDesc('walidata')
                ->orderByDesc('nilai')
                ->limit(20)
                ->get()
                ->map(fn ($row) => [
                    'opd' => $row->opd,
                    'walidata' => (int) $row->walidata,
                    'nilai' => (int) $row->nilai,
                ]),
        ]);
    }
}
