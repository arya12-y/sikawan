<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

echo '=== SCAN SEMUA SOAL: validitas jawaban ==='.PHP_EOL.PHP_EOL;

$soals = BankSoal::all();
$broken = [];
$ok = 0;

foreach ($soals as $s) {
    $jenis = strtolower((string) $s->jenis);
    $kunci = trim((string) $s->jawaban_benar);
    $pilihan = is_array($s->pilihan) ? $s->pilihan : [];

    $issues = [];

    // Pilihan ganda harus punya kunci huruf A-E yang valid + pilihan
    if ($jenis === 'pilihan_ganda') {
        if ($kunci === '' || $kunci === null) {
            $issues[] = 'TANPA JAWABAN (jawaban_benar kosong)';
        } else {
            $indeks = array_search(strtoupper($kunci), ['A', 'B', 'C', 'D', 'E'], true);
            if ($indeks === false && !in_array($kunci, $pilihan, true)) {
                $issues[] = 'KUNCI TIDAK COCOK (kunci="'.$kunci.'" tidak ada di pilihan/indeks)';
            }
            if ($indeks !== false && count($pilihan) <= $indeks) {
                $issues[] = 'KUNCI LUAR RANGE (kunci='.$kunci.' tapi pilihan cuma '.count($pilihan).')';
            }
        }
        if (count($pilihan) < 2) {
            $issues[] = 'PILIHAN KURANG ('.count($pilihan).' opsi)';
        }
    }

    if ($jenis === 'essay' || $jenis === 'esai') {
        // essay tidak perlu kunci, tapi kunci kosong berarti penguji menilai manual
        if ($kunci === '') {
            // normal — essay dinilai manual
        }
    }

    if ($issues) {
        $broken[] = [$s, $issues];
    } else {
        $ok++;
    }
}

echo 'Total soal: '.$soals->count().PHP_EOL;
echo 'OK: '.$ok.PHP_EOL;
echo 'BERMASALAH: '.count($broken).PHP_EOL.PHP_EOL;

foreach ($broken as [$s, $issues]) {
    echo '#'.$s->id.' ['.json_encode($s->tipe).'] jenis='.$s->jenis.' | '.substr($s->pertanyaan, 0, 60).PHP_EOL;
    echo '   pilihan: '.json_encode($s->pilihan).PHP_EOL;
    echo '   jawaban_benar: '.json_encode($s->jawaban_benar).PHP_EOL;
    echo '   MASALAH: '.implode('; ', $issues).PHP_EOL.PHP_EOL;
}
