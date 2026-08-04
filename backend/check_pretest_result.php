<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PretestResult;
use App\Models\User;

echo '--- PretestResult di DB ---'.PHP_EOL;
$results = PretestResult::with('user', 'kompetensi')->orderBy('id')->get();
echo 'Total rows: '.$results->count().PHP_EOL;
foreach ($results as $r) {
    echo '#'.$r->id.' user='.($r->user?->name ?? '-').' kompetensi='.($r->kompetensi?->nama ?? '-').' nilai='.$r->nilai.' sesi='.substr((string) $r->sesi_id, 0, 8).PHP_EOL;
}

echo PHP_EOL.'--- Budi (user terakhir yang submit) ---'.PHP_EOL;
$budi = User::where('email', 'budi.santoso@sikawan.test')->first();
if ($budi) {
    $latestSesi = PretestResult::where('user_id', $budi->id)->latest('completed_at')->value('sesi_id');
    echo 'latest sesi_id: '.$latestSesi.PHP_EOL;
    $bResults = PretestResult::where('user_id', $budi->id)->where('sesi_id', $latestSesi)->with('kompetensi')->get();
    echo 'rows: '.$bResults->count().PHP_EOL;
    foreach ($bResults as $r) {
        echo '  kompetensi='.($r->kompetensi?->nama ?? '-').' nilai='.$r->nilai.PHP_EOL;
    }
    echo 'rata-rata: '.round($bResults->avg('nilai'), 2).PHP_EOL;
}
