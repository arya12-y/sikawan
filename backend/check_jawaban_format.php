<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

echo '--- SAMPLE SOAL PRETEST (pilihan_ganda) ---'.PHP_EOL;
$soals = BankSoal::where('jenis', 'pilihan_ganda')
    ->whereJsonContains('tipe', 'pretest')
    ->limit(3)
    ->get(['id', 'pertanyaan', 'pilihan', 'jawaban_benar']);

foreach ($soals as $s) {
    echo '#'.$s->id.PHP_EOL;
    echo '  pertanyaan: '.$s->pertanyaan.PHP_EOL;
    echo '  pilihan: '.json_encode($s->pilihan).PHP_EOL;
    echo '  jawaban_benar: '.json_encode($s->jawaban_benar).PHP_EOL;
}
