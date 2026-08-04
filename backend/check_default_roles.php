<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Spatie\Permission\Models\Role;

foreach (['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan'] as $name) {
    $role = Role::where('name', $name)->where('guard_name', 'sanctum')->withCount('permissions')->first();
    echo $name.': '.($role?->permissions_count ?? 'MISSING').PHP_EOL;
}
