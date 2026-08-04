<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PesertaAsesmen;

echo '--- SEMUA PESERTA DENGAN KEPUTUSAN FINAL (lulus terisi) ---'.PHP_EOL;
$rows = PesertaAsesmen::with('user', 'asesmen')
    ->whereNotNull('lulus')
    ->get();

foreach ($rows as $p) {
    echo '#'.$p->id.' | '.($p->user?->name ?? '-').' | status='.$p->status
        .' | lulus='.var_export($p->lulus, true)
        .' | approved_at='.($p->approved_at ? $p->approved_at->toDateTimeString() : 'NULL')
        .' | approved_by='.($p->approved_by ?? 'NULL').PHP_EOL;
}