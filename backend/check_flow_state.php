<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\User;

echo '--- Walidata state ---'.PHP_EOL;
foreach (User::whereHas('roles', fn ($q) => $q->where('name', 'Walidata')->where('guard_name', 'sanctum'))->with('walidata')->get() as $u) {
    echo $u->email.' | activated='.($u->walidata?->pretest_activated ? 'true' : 'false').' | level='.($u->walidata?->level_id ?? '-').' | nilai='.($u->walidata?->nilai_kompetensi ?? '-').PHP_EOL;
}

echo PHP_EOL.'--- Asesmen soal composition ---'.PHP_EOL;
foreach (Asesmen::with('bankSoals')->get() as $a) {
    $pgs = $a->bankSoals->where('jenis', 'pilihan_ganda')->count();
    $essays = $a->bankSoals->where('jenis', 'essay')->count();
    echo $a->id.' | '.$a->judul.' | total='.$a->bankSoals->count().' | pg='.$pgs.' | essay='.$essays.' | status='.$a->status.PHP_EOL;
}
