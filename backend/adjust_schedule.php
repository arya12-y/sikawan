<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ExamSchedule;

$s = ExamSchedule::where('is_active', true)->first();
if (!$s) {
    echo 'No active schedule'.PHP_EOL;
    exit(1);
}

$s->update([
    'pretest_start' => now()->subDay(),
    'pretest_end' => now()->addDays(2),
    'learning_start' => now()->addDays(2),
    'learning_end' => now()->addDays(5),
    'exam_start' => now()->addDays(5),
    'exam_end' => now()->addDays(12),
]);

echo 'Schedule updated: '.$s->title.PHP_EOL;
echo 'Pretest: '.$s->pretest_start->toDateTimeString().' → '.$s->pretest_end->toDateTimeString().PHP_EOL;
echo 'Learning: '.$s->learning_start->toDateTimeString().' → '.$s->learning_end->toDateTimeString().PHP_EOL;
echo 'Exam: '.$s->exam_start->toDateTimeString().' → '.$s->exam_end->toDateTimeString().PHP_EOL;
echo 'Current phase: '.$s->current_phase.PHP_EOL;
