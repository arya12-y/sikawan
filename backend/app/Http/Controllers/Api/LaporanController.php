<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class LaporanController extends Controller
{
    public function asesmen(Request $request)
    {
        return response()->json(PesertaAsesmen::with('user', 'asesmen')->latest()->paginate((int) $request->query('per_page', 15)));
    }

    public function sertifikat(Request $request)
    {
        return response()->json(Sertifikat::with('user', 'asesmen')->latest()->paginate((int) $request->query('per_page', 15)));
    }

    public function exportPdf(Request $request)
    {
        try {
            $type = $request->query('type') === 'sertifikat' ? 'sertifikat' : 'asesmen';
            $rows = $this->reportRows($type);
            $title = $type === 'sertifikat' ? 'Laporan Sertifikat Kompetensi' : 'Laporan Hasil Asesmen';
            $html = '<h2 style="margin-bottom:4px">'.$title.'</h2><p style="color:#666">SIKAWAN — dicetak '.now()->format('Y-m-d').'</p><table width="100%" cellspacing="0" cellpadding="7" style="border-collapse:collapse;font-size:11px"><thead><tr style="background:#f1f5f9"><th align="left">Nama</th><th align="left">Asesmen / Nomor</th><th align="center">Nilai</th><th align="left">Status</th><th align="left">Tanggal</th></tr></thead><tbody>';

            foreach ($rows as $row) {
                $html .= '<tr style="border-bottom:1px solid #e5e7eb"><td>'.e($row['nama']).'</td><td>'.e($row['referensi']).'</td><td align="center">'.e((string) $row['nilai']).'</td><td>'.e($row['status']).'</td><td>'.e($row['tanggal']).'</td></tr>';
            }

            $html .= '</tbody></table>';

            return Pdf::loadHTML($html)->download('laporan-'.$type.'.pdf');
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal export PDF: '.$e->getMessage()], 500);
        }
    }

    public function exportExcel(Request $request)
    {
        try {
            $type = $request->query('type') === 'sertifikat' ? 'sertifikat' : 'asesmen';
            $csv = "nama,asesmen_atau_nomor,nilai,status,tanggal\n";

            foreach ($this->reportRows($type) as $row) {
                $csv .= implode(',', [
                    '"'.str_replace('"', '""', $row['nama']).'"',
                    '"'.str_replace('"', '""', $row['referensi']).'"',
                    $row['nilai'],
                    '"'.str_replace('"', '""', $row['status']).'"',
                    $row['tanggal'],
                ])."\n";
            }

            return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename=laporan-'.$type.'.csv']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal export Excel: '.$e->getMessage()], 500);
        }
    }

    private function reportRows(string $type): array
    {
        if ($type === 'sertifikat') {
            return Sertifikat::with('user', 'asesmen')->latest()->get()->map(fn (Sertifikat $item) => [
                'nama' => $item->user?->name ?? '-',
                'referensi' => $item->nomor_sertifikat,
                'nilai' => (int) $item->nilai_akhir,
                'status' => $item->is_active ? 'Aktif' : 'Tidak Aktif',
                'tanggal' => $item->tanggal_terbit?->format('Y-m-d') ?? '-',
            ])->all();
        }

        return PesertaAsesmen::with('user', 'asesmen')->latest()->get()->map(fn (PesertaAsesmen $item) => [
            'nama' => $item->user?->name ?? '-',
            'referensi' => $item->asesmen?->judul ?? '-',
            'nilai' => (int) ($item->nilai ?? 0),
            'status' => $item->lulus ? 'Lulus' : ($item->status === 'selesai' ? 'Tidak Lulus' : $item->status),
            'tanggal' => $item->waktu_selesai?->format('Y-m-d') ?? $item->created_at?->format('Y-m-d') ?? '-',
        ])->all();
    }
}
