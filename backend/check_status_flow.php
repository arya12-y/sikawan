<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\ExamSchedule;
use App\Models\Materi;

$materiController = file_get_contents(__DIR__.'/app/Http/Controllers/Api/MateriController.php');
$asesmenController = file_get_contents(__DIR__.'/app/Http/Controllers/Api/AsesmenController.php');
$scheduleController = file_get_contents(__DIR__.'/app/Http/Controllers/Api/ExamScheduleController.php');
$bankController = file_get_contents(__DIR__.'/app/Http/Controllers/Api/BankSoalController.php');

$publishedMateri = Materi::where('is_published', true)->count();
$draftMateri = Materi::where('is_published', false)->count();
$asesmenStatuses = Asesmen::select('status')->distinct()->pluck('status')->all();
$activeSchedules = ExamSchedule::where('is_active', true)->count();
$bankActive = BankSoal::where('is_active', true)->count();
$bankInactive = BankSoal::where('is_active', false)->count();

$checks = [
    'Materi published visibility' => $publishedMateri > 0 && str_contains($materiController, "where('is_published', true)") && str_contains($materiController, 'hasAnyRole'),
    'Materi draft exclusion' => str_contains($materiController, "where('is_published', true)"),
    'Asesmen status gating' => str_contains($asesmenController, "in_array(\$asesmen->status, ['published', 'ongoing']") && count(array_intersect($asesmenStatuses, ['published', 'ongoing'])) > 0,
    'ExamSchedule active filtering' => $activeSchedules > 0 && str_contains($scheduleController, "where('is_active', true)"),
    'BankSoal active filtering' => $bankActive > 0 && str_contains($bankController, "'is_active'") && str_contains($bankController, 'where($field, $value)') && str_contains($bankController, 'whereJsonContains'),
];

foreach ($checks as $name => $passed) echo ($passed ? 'PASS' : 'FAIL')." - {$name}".PHP_EOL;
echo "Materi rows: published={$publishedMateri}, drafts={$draftMateri}".PHP_EOL;
echo 'Asesmen statuses: '.(implode(', ', $asesmenStatuses) ?: '(none)').PHP_EOL;
echo "ExamSchedule active rows: {$activeSchedules}".PHP_EOL;
echo "BankSoal rows: active={$bankActive}, inactive={$bankInactive}".PHP_EOL;
