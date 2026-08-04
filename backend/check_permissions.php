<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

echo "==============================================\n";
echo "  SIKAWAN PERMISSION & ROLE AUDIT\n";
echo "==============================================\n\n";

// Get all permissions grouped by category
$permissions = Permission::where('guard_name', 'sanctum')->orderBy('name')->get();

echo "📋 TOTAL PERMISSIONS: " . $permissions->count() . "\n\n";

// Group by prefix
$grouped = [];
foreach ($permissions as $perm) {
    $parts = explode('.', $perm->name);
    $prefix = $parts[0] ?? 'other';
    
    if (!isset($grouped[$prefix])) {
        $grouped[$prefix] = [];
    }
    $grouped[$prefix][] = $perm->name;
}

ksort($grouped);

echo "📦 PERMISSIONS BY CATEGORY:\n";
echo str_repeat("-", 50) . "\n\n";

foreach ($grouped as $category => $perms) {
    echo "🔹 " . strtoupper($category) . " (" . count($perms) . " permissions)\n";
    foreach ($perms as $p) {
        echo "   • $p\n";
    }
    echo "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "👥 ROLES & THEIR PERMISSIONS:\n";
echo str_repeat("=", 50) . "\n\n";

$roles = Role::where('guard_name', 'sanctum')->with('permissions')->get();

foreach ($roles as $role) {
    echo "🎭 {$role->name}\n";
    echo "   Permissions: " . $role->permissions->count() . "\n";
    
    if ($role->permissions->count() > 0) {
        $groupedRolePerms = [];
        foreach ($role->permissions as $perm) {
            $prefix = explode('.', $perm->name)[0];
            if (!isset($groupedRolePerms[$prefix])) {
                $groupedRolePerms[$prefix] = [];
            }
            $groupedRolePerms[$prefix][] = $perm->name;
        }
        
        ksort($groupedRolePerms);
        
        foreach ($groupedRolePerms as $cat => $perms) {
            echo "   └─ $cat: " . implode(', ', array_map(fn($p) => explode('.', $p)[1] ?? $p, $perms)) . "\n";
        }
    }
    echo "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🔍 ROUTE PROTECTION CHECK:\n";
echo str_repeat("=", 50) . "\n\n";

// Check if routes have permission middleware
$routes = file_get_contents(__DIR__.'/routes/api.php');

$protectedGroups = [
    'user.manage' => preg_match('/permission:user\.manage/', $routes),
    'opd.manage' => preg_match('/permission:opd\.manage/', $routes),
    'materi.manage' => preg_match('/permission:materi\.manage/', $routes),
    'soal.manage' => preg_match('/permission:soal\.manage/', $routes),
    'asesmen.manage' => preg_match('/permission:asesmen\.manage/', $routes),
    'pretest.take' => preg_match('/permission:pretest\.take/', $routes),
    'learning.access' => preg_match('/permission:learning\.access/', $routes),
    'hasil.view' => preg_match('/permission:hasil\.view/', $routes),
];

foreach ($protectedGroups as $perm => $isProtected) {
    $status = $isProtected ? '✅' : '❌';
    echo "$status $perm " . ($isProtected ? '(protected in routes)' : '(NOT protected in routes)') . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "✅ AUDIT COMPLETE\n";
echo str_repeat("=", 50) . "\n";
