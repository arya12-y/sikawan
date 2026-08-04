<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

echo '--- SOAL ASESMEN (tipe asesmen) di bank soal ---'.PHP_EOL;
$soals = BankSoal::whereJsonContains('tipe', 'asesmen')
    ->where('jenis', 'pilihan_ganda')
    ->limit(6)
    ->get(['id', 'pertanyaan', 'pilihan', 'jawaban_benar']);

foreach ($soals as $s) {
    echo '#'.$s->id.PHP_EOL;
    echo '  pertanyaan: '.substr($s->pertanyaan, 0, 60).PHP_EOL;
    echo '  pilihan: '.json_encode($s->pilihan).PHP_EOL;
    echo '  jawaban_benar: '.json_encode($s->jawaban_benar).PHP_EOL.PHP_EOL;
}
