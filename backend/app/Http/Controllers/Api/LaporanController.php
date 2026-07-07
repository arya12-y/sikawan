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
        $data = $request->query('type') === 'sertifikat' ? Sertifikat::with('user')->get() : PesertaAsesmen::with('user', 'asesmen')->get();

        return Pdf::loadHTML('<pre>'.e($data->toJson(JSON_PRETTY_PRINT)).'</pre>')->download('laporan.pdf');
    }

    public function exportExcel(Request $request)
    {
        $rows = $request->query('type') === 'sertifikat' ? Sertifikat::with('user')->get() : PesertaAsesmen::with('user', 'asesmen')->get();
        $csv = "id,nama,nilai,status\n";
        foreach ($rows as $row) {
            $nama = $row->user?->name ?? '';
            $nilai = $row->nilai ?? ($row->nilai_akhir ?? '');
            $csv .= implode(',', [$row->id, '"'.str_replace('"', '""', $nama).'"', $nilai, $row->status ?? ''])."\n";
        }

        return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename=laporan.csv']);
    }
}
