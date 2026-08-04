<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Spatie\Permission\Models\Permission;

echo "==============================================\n";
echo "  PERMISSION vs FRONTEND MENU ALIGNMENT\n";
echo "==============================================\n\n";

// Frontend menu structure (from explorer analysis)
$frontendMenus = [
    'Umum' => [
        ['name' => 'Dashboard', 'path' => '/', 'permission' => 'dashboard'],
    ],
    'Master Data' => [
        ['name' => 'OPD', 'path' => '/opd', 'permission' => 'opd'],
        ['name' => 'Bidang', 'path' => '/bidang', 'permission' => 'bidang'],
        ['name' => 'Jabatan', 'path' => '/jabatan', 'permission' => 'jabatan'],
        ['name' => 'Kompetensi', 'path' => '/kompetensi', 'permission' => 'kompetensi'],
        ['name' => 'Level', 'path' => '/level', 'permission' => 'level'],
        ['name' => 'Badge', 'path' => '/badge', 'permission' => 'badge'],
        ['name' => 'Kategori', 'path' => '/kategori', 'permission' => 'kategori'],
        ['name' => 'Walidata', 'path' => '/walidata', 'permission' => 'walidata'],
        ['name' => 'Penguji', 'path' => '/penguji', 'permission' => 'penguji'],
        ['name' => 'Pengguna', 'path' => '/users', 'permission' => 'pengguna'],
        ['name' => 'Role & Hak Akses', 'path' => '/roles', 'permission' => 'pengguna', 'note' => 'Mapped to pengguna.*'],
    ],
    'Pembelajaran' => [
        ['name' => 'Pretest', 'path' => '/pretest', 'permission' => 'pretest'],
        ['name' => 'Materi (Video/PDF/Presentasi)', 'path' => '/pembelajaran/*', 'permission' => 'materi'],
        ['name' => 'Quiz', 'path' => '/pembelajaran/quiz', 'permission' => 'quiz'],
        ['name' => 'Bank Soal', 'path' => '/bank-soal', 'permission' => 'bank-soal'],
        ['name' => 'Asesmen', 'path' => '/asesmen', 'permission' => 'asesmen'],
    ],
    'Monitoring & Laporan' => [
        ['name' => 'Monitoring', 'path' => '/monitoring', 'permission' => 'monitoring'],
        ['name' => 'Penilaian', 'path' => '/penilaian', 'permission' => 'penilaian'],
        ['name' => 'Sertifikat', 'path' => '/sertifikat', 'permission' => 'sertifikat'],
        ['name' => 'Laporan', 'path' => '/laporan', 'permission' => 'laporan'],
        ['name' => 'Audit Log', 'path' => '/audit-log', 'permission' => 'audit-log'],
    ],
    'Pengaturan' => [
        ['name' => 'Notifikasi', 'path' => '/notifikasi', 'permission' => 'notifikasi'],
        ['name' => 'Jadwal', 'path' => '/exam-schedules', 'permission' => 'jadwal', 'note' => 'Route path is /exam-schedules (API endpoint)'],
    ],
];

// Get all permission prefixes from database
$allPermissions = Permission::where('guard_name', 'sanctum')->get();
$permissionPrefixes = [];
foreach ($allPermissions as $perm) {
    $prefix = explode('.', $perm->name)[0];
    if (!isset($permissionPrefixes[$prefix])) {
        $permissionPrefixes[$prefix] = [];
    }
    $permissionPrefixes[$prefix][] = $perm->name;
}
ksort($permissionPrefixes);

echo "📊 ALIGNMENT CHECK:\n";
echo str_repeat("-", 80) . "\n\n";

$aligned = 0;
$misaligned = 0;
$notes = [];

foreach ($frontendMenus as $section => $menus) {
    echo "🔹 $section\n";
    
    foreach ($menus as $menu) {
        $menuName = $menu['name'];
        $menuPath = $menu['path'];
        $expectedPerm = $menu['permission'];
        $note = $menu['note'] ?? null;
        
        $exists = isset($permissionPrefixes[$expectedPerm]);
        $status = $exists ? '✅' : '❌';
        
        echo "   $status $menuName → $expectedPerm.*\n";
        echo "      Path: $menuPath\n";
        
        if ($note) {
            echo "      Note: $note\n";
            $notes[] = "- $menuName: $note";
        }
        
        if ($exists) {
            $count = count($permissionPrefixes[$expectedPerm]);
            echo "      Permissions: $count ($expectedPerm.*)\n";
            $aligned++;
        } else {
            echo "      ⚠️  MISSING: No $expectedPerm.* permissions found!\n";
            $misaligned++;
        }
        
        echo "\n";
    }
    echo "\n";
}

echo str_repeat("=", 80) . "\n";
echo "📋 SUMMARY:\n";
echo str_repeat("=", 80) . "\n\n";

echo "Total Frontend Menus: " . array_sum(array_map('count', $frontendMenus)) . "\n";
echo "✅ Aligned: $aligned\n";
echo "❌ Misaligned: $misaligned\n";
echo "\nAlignment Rate: " . round(($aligned / ($aligned + $misaligned)) * 100, 1) . "%\n\n";

if (!empty($notes)) {
    echo "📝 NOTES:\n";
    foreach ($notes as $note) {
        echo "$note\n";
    }
    echo "\n";
}

echo str_repeat("=", 80) . "\n";
echo "🔍 ORPHANED PERMISSIONS (tidak ada menu):\n";
echo str_repeat("=", 80) . "\n\n";

$expectedPrefixes = array_unique(array_column(array_merge(...array_values($frontendMenus)), 'permission'));
$orphaned = array_diff(array_keys($permissionPrefixes), $expectedPrefixes);

if (empty($orphaned)) {
    echo "✅ No orphaned permissions - all permissions have corresponding menus!\n";
} else {
    foreach ($orphaned as $prefix) {
        $count = count($permissionPrefixes[$prefix]);
        echo "⚠️  $prefix.* ($count permissions) - tidak ada menu frontend\n";
        echo "   Permissions: " . implode(', ', $permissionPrefixes[$prefix]) . "\n\n";
    }
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "✅ ALIGNMENT AUDIT COMPLETE\n";
echo str_repeat("=", 80) . "\n";
