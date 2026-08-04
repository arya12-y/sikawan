<?php

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
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SertifikatController;

use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\ExamScheduleController;
use App\Http\Controllers\Api\PretestController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WawancaraController;
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
    Route::get('bank-soals/export', [BankSoalController::class, 'export'])->middleware('permission:bank-soal.export');
    Route::post('bank-soals/import', [BankSoalController::class, 'import'])->middleware('permission:bank-soal.import');
    Route::apiResource('sertifikats', SertifikatController::class)->only(['index']);
    Route::apiResource('notifikasis', NotifikasiController::class)->only(['index']);
    Route::post('notifikasis', [NotifikasiController::class, 'store'])->middleware('permission:notifikasi.create');
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index'])->middleware('permission:audit-log.view');
    Route::get('sertifikats/{sertifikat}/download', [SertifikatController::class, 'download']);

    foreach ([
        'opds' => [OpdController::class, 'opd', 'opd'],
        'bidangs' => [BidangController::class, 'bidang', 'bidang'],
        'jabatans' => [JabatanController::class, 'jabatan', 'jabatan'],
        'kompetensis' => [KompetensiController::class, 'kompetensi', 'kompetensi'],
        'levels' => [LevelController::class, 'level', 'level'],
        'badges' => [BadgeController::class, 'badge', 'badge'],
        'kategoris' => [KategoriController::class, 'kategori', 'kategori'],
        'walidatas' => [WalidataController::class, 'walidata', 'walidata'],
        'pengujis' => [PengujiController::class, 'penguji', 'penguji'],
    ] as $uri => [$controller, $permission, $parameter]) {
        Route::get($uri, [$controller, 'index'])->middleware("permission:{$permission}.view");
        Route::post($uri, [$controller, 'store'])->middleware("permission:{$permission}.create");
        Route::get("{$uri}/{{$parameter}}", [$controller, 'show'])->middleware("permission:{$permission}.view");
        Route::put("{$uri}/{{$parameter}}", [$controller, 'update'])->middleware("permission:{$permission}.update");
        Route::patch("{$uri}/{{$parameter}}", [$controller, 'update'])->middleware("permission:{$permission}.update");
        Route::delete("{$uri}/{{$parameter}}", [$controller, 'destroy'])->middleware("permission:{$permission}.delete");
    }
    Route::get('users', [UserController::class, 'index'])->middleware('permission:pengguna.view');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:pengguna.create');
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:pengguna.view');
    Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:pengguna.update');
    Route::patch('users/{user}', [UserController::class, 'update'])->middleware('permission:pengguna.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:pengguna.delete');
    Route::get('roles', [RoleController::class, 'index'])->middleware('permission:pengguna.view');
    Route::post('roles', [RoleController::class, 'store'])->middleware('permission:pengguna.create');
    Route::get('roles/{role}', [RoleController::class, 'show'])->middleware('permission:pengguna.view');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:pengguna.update');
    Route::patch('roles/{role}', [RoleController::class, 'update'])->middleware('permission:pengguna.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:pengguna.delete');
    Route::get('permissions', [PermissionController::class, 'index'])->middleware('permission:pengguna.view');
    Route::get('materis', [MateriController::class, 'index'])->middleware('permission:materi.view');
    Route::post('materis', [MateriController::class, 'store'])->middleware('permission:materi.create');
    Route::get('materis/{materi}', [MateriController::class, 'show'])->middleware('permission:materi.view');
    Route::put('materis/{materi}', [MateriController::class, 'update'])->middleware('permission:materi.update');
    Route::patch('materis/{materi}', [MateriController::class, 'update'])->middleware('permission:materi.update');
    Route::delete('materis/{materi}', [MateriController::class, 'destroy'])->middleware('permission:materi.delete');
    Route::get('bank-soals', [BankSoalController::class, 'index'])->middleware('permission:bank-soal.view');
    Route::post('bank-soals', [BankSoalController::class, 'store'])->middleware('permission:bank-soal.create');
    Route::get('bank-soals/{bank_soal}', [BankSoalController::class, 'show'])->middleware('permission:bank-soal.view');
    Route::put('bank-soals/{bank_soal}', [BankSoalController::class, 'update'])->middleware('permission:bank-soal.update');
    Route::patch('bank-soals/{bank_soal}', [BankSoalController::class, 'update'])->middleware('permission:bank-soal.update');
    Route::delete('bank-soals/{bank_soal}', [BankSoalController::class, 'destroy'])->middleware('permission:bank-soal.delete');
    Route::get('asesmens', [AsesmenController::class, 'index'])->middleware('permission:asesmen.view');
    Route::post('asesmens', [AsesmenController::class, 'store'])->middleware('permission:asesmen.create');
    Route::get('asesmens/{asesmen}', [AsesmenController::class, 'show'])->middleware('permission:asesmen.view');
    Route::put('asesmens/{asesmen}', [AsesmenController::class, 'update'])->middleware('permission:asesmen.update');
    Route::patch('asesmens/{asesmen}', [AsesmenController::class, 'update'])->middleware('permission:asesmen.update');
    Route::delete('asesmens/{asesmen}', [AsesmenController::class, 'destroy'])->middleware('permission:asesmen.delete');
    Route::post('asesmens/{asesmen}/attach-soals', [AsesmenController::class, 'attachSoals'])->middleware('permission:asesmen.update');

    Route::middleware('permission:materi.view')->group(function (): void {
        Route::post('materi/{materi}/progress', [MateriController::class, 'trackProgress']);
        Route::get('materi/{materi}/quiz', [MateriController::class, 'quiz']);
        Route::post('materi/{materi}/quiz-submit', [MateriController::class, 'submitQuiz']);
        Route::get('quiz/start', [QuizController::class, 'start']);
        Route::post('quiz/check', [QuizController::class, 'check']);
    });
    Route::middleware('permission:asesmen.start')->group(function (): void {
        Route::post('asesmen/minta-reset', [AsesmenController::class, 'mintaReset']);
        Route::post('asesmens/{asesmen}/start', [AsesmenController::class, 'start']);
        Route::post('peserta-asesmens/{peserta}/save-answer', [AsesmenController::class, 'saveAnswer']);
        Route::post('peserta-asesmens/{peserta}/submit', [AsesmenController::class, 'submit']);
        Route::post('peserta-asesmens/{peserta}/reset', [AsesmenController::class, 'reset']);
    });
    Route::middleware('permission:penilaian.grade')->group(function (): void {
        Route::post('jawaban-pesertas/{jawaban}/grade-essay', [AsesmenController::class, 'gradeEssay']);
        Route::post('peserta-asesmens/{peserta}/approve', [AsesmenController::class, 'approve']);
        Route::post('peserta-asesmens/{peserta}/tolak', [AsesmenController::class, 'tolak']);
    });
    Route::middleware('permission:penilaian.view')->get('penilaian/essay', [AsesmenController::class, 'daftarEssay']);
    Route::get('penilaian/riwayat', [AsesmenController::class, 'riwayatVerifikasi'])->middleware('permission:penilaian.view');
    Route::middleware('permission:monitoring.view')->group(function (): void {
        Route::get('monitoring', [MonitoringController::class, 'index']);
        Route::get('monitoring/users/{user}', [MonitoringController::class, 'user']);
        Route::delete('monitoring/{id}', [MonitoringController::class, 'destroy']);
    });
    Route::middleware('permission:laporan.view')->group(function (): void {
        Route::get('laporan/asesmen', [LaporanController::class, 'asesmen']);
        Route::get('laporan/sertifikat', [LaporanController::class, 'sertifikat']);
    });
    Route::get('laporan/export-pdf', [LaporanController::class, 'exportPdf'])
        ->middleware('permission:laporan.export-pdf');
    Route::get('laporan/export-excel', [LaporanController::class, 'exportExcel'])
        ->middleware('permission:laporan.export-excel');
    Route::post('notifikasis/mark-all-read', [NotifikasiController::class, 'markAllRead']);
    Route::post('notifikasis/{notifikasi}/mark-read', [NotifikasiController::class, 'markRead']);
    Route::delete('notifikasis/{notifikasi}', [NotifikasiController::class, 'destroy']);
    Route::get('exam-schedules/active', [ExamScheduleController::class, 'active'])->middleware('permission:jadwal.view');
    Route::get('exam-schedules/stats', [ExamScheduleController::class, 'stats'])->middleware('permission:jadwal.view');
    Route::get('exam-schedules', [ExamScheduleController::class, 'index'])->middleware('permission:jadwal.view');
    Route::post('exam-schedules', [ExamScheduleController::class, 'store'])->middleware('permission:jadwal.create');
    Route::put('exam-schedules/{exam_schedule}', [ExamScheduleController::class, 'update'])->middleware('permission:jadwal.update');
    Route::patch('exam-schedules/{exam_schedule}', [ExamScheduleController::class, 'update'])->middleware('permission:jadwal.update');
    Route::delete('exam-schedules/{exam_schedule}', [ExamScheduleController::class, 'destroy'])->middleware('permission:jadwal.delete');
    Route::get('my-status', [ExamScheduleController::class, 'myStatus']);
    Route::middleware('permission:pretest.take')->group(function (): void {
    Route::post('pretest/start', [PretestController::class, 'start']);
    Route::post('pretest/submit', [PretestController::class, 'submit']);
    Route::get('pretest/detail', [PretestController::class, 'detail']);
    Route::post('pretest/reset', [PretestController::class, 'reset']);
    });
    Route::middleware('permission:monitoring.view')->group(function (): void {
        Route::get('pretest/monitoring', [PretestController::class, 'monitoring']);
        Route::get('pretest/pending', [PretestController::class, 'pending']);
    });
    Route::middleware('permission:pretest.take')->group(function (): void {
        Route::post('pretest/activate', [PretestController::class, 'activate']);
        Route::post('pretest/activate-all', [PretestController::class, 'activateAll']);
        Route::post('pretest/deactivate', [PretestController::class, 'deactivate']);
        Route::post('pretest/cleanup', [PretestController::class, 'cleanup']);
    });
    Route::middleware('permission:penilaian.view')->group(function (): void {
        Route::get('penilaian/wawancara', [WawancaraController::class, 'index']);
        Route::get('penilaian/wawancara/{wawancara}', [WawancaraController::class, 'show']);
    });
    Route::middleware('permission:penilaian.grade')->group(function (): void {
        Route::post('penilaian/wawancara/{peserta}/jadwal', [WawancaraController::class, 'jadwal']);
        Route::put('penilaian/wawancara/{wawancara}/nilai', [WawancaraController::class, 'nilai']);
        Route::post('penilaian/wawancara/{wawancara}/selesai', [WawancaraController::class, 'selesai']);
        Route::delete('penilaian/wawancara/{wawancara}', [WawancaraController::class, 'destroy']);
    });
});
