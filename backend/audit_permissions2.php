<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

$dbPerms = Permission::where('guard_name', 'sanctum')->pluck('name')->sort()->values();

// Resolved route permissions dari route:list -v
$routeOutput = shell_exec('php artisan route:list --path=api -v 2>&1');
preg_match_all("/CheckPermission:([a-z0-9.\-_]+)/", $routeOutput, $m);
$routePerms = collect($m[1])->unique()->sort()->values();

echo "=== DB permissions: ".$dbPerms->count()." ===\n";
echo "=== Route permissions (resolved): ".$routePerms->count()." ===\n\n";

// 1. Dipakai route tapi tidak ada di DB → RUSAK (500)
$missing = $routePerms->diff($dbPerms);
echo "--- Route pakai tapi TIDAK ada di DB (".$missing->count().") ---\n";
foreach ($missing as $p) echo "  ❌ $p\n";
if ($missing->isEmpty()) echo "  ✅ tidak ada - semua route permission terdefinisi\n";

// 2. Ada di DB tapi TIDAK dipakai route → kemungkinan unused/UI check
$unused = $dbPerms->diff($routePerms);
echo "\n--- Ada di DB tapi TIDAK dipakai route (".$unused->count().") ---\n";
foreach ($unused as $p) {
    $roles = Role::where('guard_name', 'sanctum')->whereHas('permissions', fn ($q) => $q->where('name', $p))->pluck('name')->join(', ');
    echo "  • $p [roles: ".($roles ?: '-')."]\n";
}

echo "\n=== SELESAI ===\n";
