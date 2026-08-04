<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\ExamSchedule;
use App\Models\Kategori;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\User;
use App\Models\Walidata;

echo 'Kompetensi: '.Kompetensi::count().PHP_EOL;
echo 'Level: '.Level::count().PHP_EOL;
echo 'Kategori: '.Kategori::count().PHP_EOL;
echo 'BankSoal: '.BankSoal::count().PHP_EOL;
echo 'Asesmen: '.Asesmen::count().PHP_EOL;
echo 'Jadwal: '.ExamSchedule::count().PHP_EOL;
echo 'Users: '.User::count().PHP_EOL;
echo 'Walidata: '.Walidata::count().PHP_EOL;
echo PHP_EOL.'--- Kompetensi ---'.PHP_EOL;
foreach (Kompetensi::all(['id', 'nama']) as $k) {
    echo $k->id.' | '.$k->nama.PHP_EOL;
}
echo PHP_EOL.'--- Level ---'.PHP_EOL;
foreach (Level::all(['id', 'nama']) as $l) {
    echo $l->id.' | '.$l->nama.PHP_EOL;
}
echo PHP_EOL.'--- Kategori ---'.PHP_EOL;
foreach (Kategori::all(['id', 'nama']) as $c) {
    echo $c->id.' | '.$c->nama.PHP_EOL;
}
