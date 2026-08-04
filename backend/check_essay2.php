<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;

echo "=== SOAL ESSAY DI BANK SOAL ===\n";
$essays = BankSoal::where('jenis', 'essay')->get(['id', 'kompetensi_id']);
echo 'Total essay soal: '.$essays->count()."\n";
foreach ($essays as $e) echo "  #{$e->id} kompetensi={$e->kompetensi_id}\n";

echo "\n=== KOMPOSISI SOAL PER ASESMEN ===\n";
foreach (Asesmen::with('bankSoals')->get() as $a) {
    $pg = $a->bankSoals->where('jenis', 'pilihan_ganda')->count();
    $es = $a->bankSoals->where('jenis', 'essay')->count();
    echo "#{$a->id} {$a->judul} | jumlah_soal={$a->jumlah_soal} pg={$pg} essay={$es}\n";
}
