<?php

// Handle CORS preflight requests (skip in CLI/test)
if (php_sapi_name() !== 'cli' && ($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    exit(0);
}

use App\Http\Controllers\Api\AsesmenController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\BankSoalController;
use App\Http\Controllers\Api\BidangController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JabatanController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\KompetensiController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\LevelController;
use App\Http\Controllers\Api\MateriController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\OpdController;
use App\Http\Controllers\Api\PengujiController;
use App\Http\Controllers\Api\SertifikatController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalidataController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);
Route::get('sertifikat/verify/{nomor}', [SertifikatController::class, 'verify']);
Route::get('materi/{materi}/file', [MateriController::class, 'serveFile']);
Route::get('materi/{materi}/download', [MateriController::class, 'downloadFile']);
Route::get('materi/{materi}/thumbnail', [MateriController::class, 'serveThumbnail']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::match(['put', 'patch'], 'profile', [AuthController::class, 'updateProfile']);
    Route::get('sessions', [AuthController::class, 'sessions']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('bank-soals/export', [BankSoalController::class, 'export']);
    Route::post('bank-soals/import', [BankSoalController::class, 'import']);
    Route::get('bank-soals/{bankSoal}/preview', [BankSoalController::class, 'preview']);
    Route::apiResource('sertifikats', SertifikatController::class)->only(['index']);
    Route::apiResource('notifikasis', NotifikasiController::class)->only(['index', 'store']);
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index']);
    Route::post('sertifikats/generate/{peserta}', [SertifikatController::class, 'generate']);
    Route::get('sertifikats/{sertifikat}/download', [SertifikatController::class, 'download']);

    Route::apiResources([
        'opds' => OpdController::class,
        'bidangs' => BidangController::class,
        'jabatans' => JabatanController::class,
        'kompetensis' => KompetensiController::class,
        'levels' => LevelController::class,
        'badges' => BadgeController::class,
        'kategoris' => KategoriController::class,
        'users' => UserController::class,
        'walidatas' => WalidataController::class,
        'pengujis' => PengujiController::class,
        'materis' => MateriController::class,
        'bank-soals' => BankSoalController::class,
        'asesmens' => AsesmenController::class,
    ]);

    Route::post('materi/{materi}/publish', [MateriController::class, 'publish']);
    Route::post('materi/{materi}/progress', [MateriController::class, 'trackProgress']);
    Route::post('asesmens/{asesmen}/attach-soals', [AsesmenController::class, 'attachSoals']);
    Route::post('asesmens/{asesmen}/start', [AsesmenController::class, 'start']);
    Route::post('peserta-asesmens/{peserta}/save-answer', [AsesmenController::class, 'saveAnswer']);
    Route::post('peserta-asesmens/{peserta}/submit', [AsesmenController::class, 'submit']);
    Route::get('peserta-asesmens/{peserta}/review', [AsesmenController::class, 'review']);
    Route::post('jawaban-pesertas/{jawaban}/grade-essay', [AsesmenController::class, 'gradeEssay']);
    Route::get('monitoring', [MonitoringController::class, 'index']);
    Route::get('monitoring/users/{user}', [MonitoringController::class, 'user']);
    Route::get('laporan/asesmen', [LaporanController::class, 'asesmen']);
    Route::get('laporan/sertifikat', [LaporanController::class, 'sertifikat']);
    Route::get('laporan/export-pdf', [LaporanController::class, 'exportPdf']);
    Route::get('laporan/export-excel', [LaporanController::class, 'exportExcel']);
    Route::post('notifikasis/mark-all-read', [NotifikasiController::class, 'markAllRead']);
    Route::post('notifikasis/{notifikasi}/mark-read', [NotifikasiController::class, 'markRead']);
    Route::get('settings', [SettingController::class, 'index']);
    Route::put('settings', [SettingController::class, 'update']);
});
