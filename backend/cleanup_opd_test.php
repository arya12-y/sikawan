<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Opd;

$opds = Opd::where('kode', 'like', 'OPDTEST%')->orWhere('nama', 'like', 'OPD Test E2E%')->get();
echo 'Ditemukan '.$opds->count().' OPD test:\n';
foreach ($opds as $o) {
    echo '  #'.$o->id.' '.$o->kode.' '.$o->nama.PHP_EOL;
    $o->forceDelete();
}
echo 'Sisa OPD: '.Opd::count().PHP_EOL;
