<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;

echo '--- Essay soal di bank soal ---'.PHP_EOL;
foreach (BankSoal::where('jenis', 'essay')->get(['id', 'kompetensi_id', 'tipe']) as $s) {
    echo 'essay#'.$s->id.' kompetensi='.$s->kompetensi_id.' tipe='.json_encode($s->tipe).PHP_EOL;
}

echo PHP_EOL.'--- Asesmen uji essay ---'.PHP_EOL;
$a = Asesmen::where('judul', 'like', 'Uji Essay%')->latest()->first();
if ($a) {
    echo 'asesmen_id='.$a->id.' jumlah_soal='.$a->jumlah_soal.' status='.$a->status.PHP_EOL;
    foreach ($a->bankSoals as $s) {
        echo '  attached#'.$s->id.' '.$s->jenis.' kompetensi='.$s->kompetensi_id.' tipe='.json_encode($s->tipe).PHP_EOL;
    }
} else {
    echo 'tidak ada'.PHP_EOL;
}

echo PHP_EOL.'--- Semua asesmen: soal ter-attach ---'.PHP_EOL;
foreach (Asesmen::with('bankSoals')->get() as $x) {
    echo $x->id.' | '.$x->judul.' | attached='.$x->bankSoals->count().PHP_EOL;
}
