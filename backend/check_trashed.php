<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;

$m = Materi::withTrashed()->find(42);
if ($m && $m->trashed()) {
    $m->restore();
}
echo 'Materi #42 withTrashed: '.($m ? 'ADA' : 'TIDAK ADA').PHP_EOL;
if ($m) {
    echo '  deleted_at: '.($m->deleted_at ?? 'NULL (belum dihapus)').PHP_EOL;
}
$n = Materi::find(42);
echo 'Materi #42 normal query: '.($n ? 'ADA (muncul di index)' : 'TIDAK ADA (tersaring)').PHP_EOL;
