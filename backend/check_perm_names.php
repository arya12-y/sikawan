<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Permission;

echo 'ASESMEN: '.Permission::where('name', 'like', 'asesmen.%')->pluck('name')->join(', ').PHP_EOL;
echo 'KOMPETENSI: '.Permission::where('name', 'like', 'kompetensi.%')->pluck('name')->join(', ').PHP_EOL;
echo 'LEVEL: '.Permission::where('name', 'like', 'level.%')->pluck('name')->join(', ').PHP_EOL;

echo PHP_EOL.'--- SEMUA MODULE DI DATABASE ---'.PHP_EOL;
$all = Permission::pluck('name')->sort()->values();
$modules = collect();
foreach ($all as $name) {
    $modules->push(explode('.', $name)[0]);
}
echo $modules->unique()->sort()->join(', ').PHP_EOL;

echo PHP_EOL.'--- TOTAL PERMISSIONS: '.$all->count().' ---'.PHP_EOL;
