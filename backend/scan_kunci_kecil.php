<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

echo '--- SOAL DENGAN JAWABAN HURUF KECIL (bukan A-D besar) ---'.PHP_EOL;
$soals = BankSoal::all();
$lowercase = [];
$uppercase = [];
foreach ($soals as $s) {
    if (strtolower((string) $s->jenis) !== 'pilihan_ganda') continue;
    $kunci = trim((string) $s->jawaban_benar);
    if ($kunci === '') continue;
    if (preg_match('/^[a-e]$/', $kunci)) {
        $lowercase[] = $s;
    } elseif (preg_match('/^[A-E]$/', $kunci)) {
        $uppercase[] = $s;
    } else {
        // kunci berupa teks
        $lowercase[] = $s; // tandai sebagai non-A-E uppercase
    }
}
echo 'Kunci huruf BESAR (A-E): '.count($uppercase).PHP_EOL;
echo 'Kunci lain (kecil/teks): '.count($lowercase).PHP_EOL.PHP_EOL;

foreach ($lowercase as $s) {
    echo '#'.$s->id.' ['.json_encode($s->tipe).'] jenis='.$s->jenis.PHP_EOL;
    echo '  jawaban_benar: '.json_encode($s->jawaban_benar).PHP_EOL;
    echo '  pilihan: '.json_encode($s->pilihan).PHP_EOL.PHP_EOL;
}
