<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'opd.view', 'opd.create', 'opd.update', 'opd.delete', 'opd.import', 'opd.export',
            'bidang.view', 'bidang.create', 'bidang.update', 'bidang.delete', 'bidang.import', 'bidang.export',
            'jabatan.view', 'jabatan.create', 'jabatan.update', 'jabatan.delete', 'jabatan.import', 'jabatan.export',
            'walidata.view', 'walidata.create', 'walidata.update', 'walidata.delete', 'walidata.import', 'walidata.export',
            'penguji.view', 'penguji.create', 'penguji.update', 'penguji.delete', 'penguji.import', 'penguji.export',
            'kompetensi.view', 'kompetensi.create', 'kompetensi.update', 'kompetensi.delete', 'kompetensi.import', 'kompetensi.export',
            'level.view', 'level.create', 'level.update', 'level.delete', 'level.import', 'level.export',
            'badge.view', 'badge.create', 'badge.update', 'badge.delete',
            'materi.view', 'materi.create', 'materi.update', 'materi.delete', 'materi.import', 'materi.export', 'materi.publish',
            'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
            'pengguna.view', 'pengguna.create', 'pengguna.update', 'pengguna.delete',
            'bank-soal.view', 'bank-soal.create', 'bank-soal.update', 'bank-soal.delete', 'bank-soal.import', 'bank-soal.export',
            'quiz.view', 'quiz.create', 'quiz.update', 'quiz.delete', 'quiz.start',
            'asesmen.view', 'asesmen.create', 'asesmen.update', 'asesmen.delete', 'asesmen.start', 'asesmen.grade', 'asesmen.review',
            'penilaian.view', 'penilaian.update',
            'sertifikat.view', 'sertifikat.create', 'sertifikat.download', 'sertifikat.print',
            'monitoring.view',
            'laporan.view', 'laporan.export-pdf', 'laporan.export-excel',
            'audit-log.view',
            'notifikasi.view', 'notifikasi.create', 'notifikasi.update', 'notifikasi.delete',
            'profile.update',
            'password.change',
            'session.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = [
            'Super Admin' => $permissions,
            'Admin Diskominfo' => array_values(array_filter($permissions, fn (string $permission): bool => $permission !== 'audit-log.view')),
            'Penguji' => [
                'dashboard.view',
                'bank-soal.view', 'bank-soal.create', 'bank-soal.update', 'bank-soal.delete', 'bank-soal.import', 'bank-soal.export',
                'asesmen.view', 'asesmen.grade', 'asesmen.review',
                'penilaian.view', 'penilaian.update',
                'materi.view',
                'laporan.view',
                'profile.update',
                'password.change',
            ],
            'Walidata' => [
                'dashboard.view',
                'materi.view',
                'quiz.view', 'quiz.start',
                'asesmen.view', 'asesmen.start', 'asesmen.review',
                'sertifikat.view', 'sertifikat.download',
                'monitoring.view',
                'notifikasi.view',
                'profile.update',
                'password.change',
            ],
            'Pimpinan' => [
                'dashboard.view',
                'monitoring.view',
                'laporan.view', 'laporan.export-pdf', 'laporan.export-excel',
                'sertifikat.view',
                'audit-log.view',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web'])->syncPermissions($rolePermissions);
        }

        $users = [
            ['name' => 'Super Admin', 'email' => 'admin@sikawan.test', 'role' => 'Super Admin'],
            ['name' => 'Admin Diskominfo', 'email' => 'diskominfo@sikawan.test', 'role' => 'Admin Diskominfo'],
            ['name' => 'Penguji', 'email' => 'penguji@sikawan.test', 'role' => 'Penguji'],
            ['name' => 'Walidata', 'email' => 'walidata@sikawan.test', 'role' => 'Walidata'],
            ['name' => 'Pimpinan', 'email' => 'pimpinan@sikawan.test', 'role' => 'Pimpinan'],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ]
            );

            $user->syncRoles([$userData['role']]);
        }
    }
}
