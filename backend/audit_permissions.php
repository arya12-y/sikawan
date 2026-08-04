<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

// 1. Semua permission di DB
$dbPerms = Permission::where('guard_name', 'sanctum')->pluck('name')->sort()->values();
echo "=== PERMISSIONS DI DATABASE: ".$dbPerms->count()." ===\n\n";

// 2. Ekstrak semua permission yang dipakai di routes
$routeFile = file_get_contents(__DIR__.'/routes/api.php');
preg_match_all("/permission:([a-z0-9.\-_]+)/", $routeFile, $m);
$routePerms = collect($m[1])->unique()->sort()->values();
echo "=== PERMISSIONS DIPAKAI DI ROUTES: ".$routePerms->count()." ===\n";

// 3. Permission di DB tapi TIDAK dipakai route
$unused = $dbPerms->diff($routePerms);
echo "\n--- Permission ADA di DB tapi TIDAK dipakai route (".$unused->count().") ---\n";
foreach ($unused as $p) {
    $roles = Role::where('guard_name', 'sanctum')->whereHas('permissions', fn ($q) => $q->where('name', $p))->pluck('name')->join(', ');
    echo "  • $p  [diberikan ke: ".($roles ?: 'TIDAK ADA')."]\n";
}

// 4. Route pakai permission tapi TIDAK ada di DB
$missing = $routePerms->diff($dbPerms);
echo "\n--- Permission dipakai route tapi TIDAK ada di DB (".$missing->count().") ---\n";
foreach ($missing as $p) {
    echo "  ❌ $p\n";
}

// 5. Per-role: cek permission yang di-assign tapi tidak ada di DB
echo "\n--- Role assignments vs DB ---\n";
foreach (Role::where('guard_name', 'sanctum')->with('permissions')->get() as $role) {
    $rolePerms = $role->permissions->pluck('name')->sort()->values();
    $broken = $rolePerms->diff($dbPerms);
    echo "  {$role->name}: {$rolePerms->count()} permission".($broken->count() ? " | ❌ referensi rusak: ".$broken->join(', ') : '')."\n";
}

echo "\n=== SELESAI ===\n";
