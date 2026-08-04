<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

echo 'notifikasi.create exists: '.(Permission::where('name', 'notifikasi.create')->where('guard_name', 'sanctum')->exists() ? 'yes' : 'no').PHP_EOL;
foreach (['Super Admin', 'Admin Diskominfo', 'Penguji', 'Walidata', 'Pimpinan'] as $name) {
    $role = Role::where('name', $name)->where('guard_name', 'sanctum')->first();
    echo $name.': '.($role?->hasPermissionTo('notifikasi.create') ? 'yes' : 'no').PHP_EOL;
}
