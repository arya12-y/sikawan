<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

// Jawaban benar untuk soal pretest yang didapat Budi
$ids = [7, 11, 9, 10, 6, 15, 13, 12, 8, 14];
$soals = BankSoal::whereIn('id', $ids)->get(['id', 'jawaban_benar', 'jenis']);

echo json_encode($soals->map(fn ($s) => [
    'soal_id' => $s->id,
    'jawaban' => $s->jawaban_benar,
])->all());
