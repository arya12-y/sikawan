<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PesertaAsesmen;

// Backfill approved_at untuk peserta yang punya keputusan final tapi approved_at NULL
$fixed = 0;
$rows = PesertaAsesmen::whereNotNull('lulus')->whereNull('approved_at')->get();
foreach ($rows as $p) {
    $p->update(['approved_at' => $p->updated_at ?? $p->waktu_selesai ?? now()]);
    echo 'Fixed #'.$p->id.' '.($p->user?->name ?? '-').' approved_at='.$p->approved_at->toDateTimeString().PHP_EOL;
    $fixed++;
}
echo PHP_EOL.'Total fixed: '.$fixed.PHP_EOL;
