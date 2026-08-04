<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PesertaAsesmen;

// Cek semua peserta asesmen dan tipe field lulus di DB
$pesertas = PesertaAsesmen::with('user')->get();
foreach ($pesertas as $p) {
    $var = var_export($p->lulus, true);
    echo '#'.$p->id.' user='.($p->user?->name ?? '-').' status='.$p->status.' lulus='.$var.PHP_EOL;
}
