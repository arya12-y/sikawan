<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asesmen;
use App\Models\AuditLog;
use App\Models\BankSoal;
use App\Models\Materi;
use App\Models\Opd;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\User;
use App\Models\Walidata;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'totals' => ['users' => User::count(), 'opd' => Opd::count(), 'walidata' => Walidata::count(), 'materi' => Materi::count(), 'bank_soal' => BankSoal::count(), 'asesmen' => Asesmen::count(), 'peserta' => PesertaAsesmen::count(), 'sertifikat' => Sertifikat::count()],
            'charts' => ['asesmen_status' => PesertaAsesmen::selectRaw('status, count(*) total')->groupBy('status')->get(), 'sertifikat_monthly' => Sertifikat::selectRaw('MONTH(tanggal_terbit) month, count(*) total')->groupBy('month')->get()],
            'top_opd' => Opd::withCount('walidatas')->orderByDesc('walidatas_count')->limit(5)->get(),
            'top_walidata' => Walidata::with('user', 'opd')->orderByDesc('nilai_kompetensi')->limit(5)->get(),
            'recent_audit_logs' => AuditLog::with('user')->latest()->limit(10)->get(),
        ]);
    }
}
