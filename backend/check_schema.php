<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;

echo 'bank_soals: '.implode(', ', Schema::getColumnListing('bank_soals')).PHP_EOL.PHP_EOL;
echo 'asesmen_soals: '.implode(', ', Schema::getColumnListing('asesmen_soals')).PHP_EOL.PHP_EOL;
echo 'exam_schedules: '.implode(', ', Schema::getColumnListing('exam_schedules')).PHP_EOL.PHP_EOL;

$b = App\Models\BankSoal::first();
if ($b) {
    echo 'Sample soal tipe: '.json_encode($b->tipe).' | jenis: '.$b->jenis.' | bobot: '.$b->bobot.PHP_EOL;
    echo 'Sample pilihan: '.json_encode($b->pilihan).PHP_EOL;
}

$a = App\Models\Asesmen::first();
if ($a) {
    echo 'Sample asesmen: '.$a->judul.' | jumlah_soal: '.$a->jumlah_soal.' | durasi: '.$a->durasi.' | nilai_lulus: '.$a->nilai_lulus.' | status: '.$a->status.PHP_EOL;
    echo 'kompetensi_ids: '.json_encode($a->kompetensi_ids).PHP_EOL;
    echo 'soal count: '.$a->bankSoals()->count().PHP_EOL;
}
