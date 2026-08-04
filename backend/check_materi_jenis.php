<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;

echo '--- MATERI PUBLISHED per JENIS ---'.PHP_EOL;
$all = Materi::where('is_published', true)->get();
echo 'Total: '.$all->count().PHP_EOL;

// Kelompokkan per jenis
$byJenis = $all->groupBy('jenis');
foreach ($byJenis as $jenis => $list) {
    echo PHP_EOL.'JENIS: '.$jenis.' ('.$list->count().')'.PHP_EOL;
    foreach ($list as $m) {
        echo '  #'.$m->id.' | level='.($m->level?->nama ?? '?').' | '.$m->judul.PHP_EOL;
    }
}
