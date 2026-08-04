<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;

echo '--- MATERI PUBLISHED: soals_count (dari withCount) ---'.PHP_EOL;
foreach (Materi::where('is_published', true)->withCount('soals')->get() as $m) {
    $badge = $m->soals_count > 0 ? '' : '  ← badge "Unduh untuk selesaikan" muncul';
    echo '#'.$m->id.' '.$m->judul.' | soal='.$m->soals_count.$badge.PHP_EOL;
}
