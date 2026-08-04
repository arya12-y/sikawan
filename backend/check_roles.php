<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Role;

foreach (Role::where('guard_name', 'sanctum')->with('permissions')->get() as $role) {
    echo '=== '.$role->name.' ('.$role->permissions->count().') ==='.PHP_EOL;
    echo $role->permissions->pluck('name')->sort()->implode(', ').PHP_EOL.PHP_EOL;
}
