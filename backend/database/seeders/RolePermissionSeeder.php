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

        Permission::whereIn('name', [
            'user.manage', 'opd.manage', 'materi.manage', 'soal.manage',
            'asesmen.manage', 'jadwal.manage', 'materi.publish',
        ])->delete();

        Permission::where('name', 'hasil.view')
            ->where('guard_name', 'sanctum')
            ->delete();

        $permissions = [
            'dashboard.view',
            'master-data.view',
            'opd.view', 'opd.create', 'opd.update', 'opd.delete',
            'bidang.view', 'bidang.create', 'bidang.update', 'bidang.delete',
            'jabatan.view', 'jabatan.create', 'jabatan.update', 'jabatan.delete',
            'walidata.view', 'walidata.create', 'walidata.update', 'walidata.delete',
            'penguji.view', 'penguji.create', 'penguji.update', 'penguji.delete',
            'kompetensi.view', 'kompetensi.create', 'kompetensi.update', 'kompetensi.delete',
            'level.view', 'level.create', 'level.update', 'level.delete',
            'badge.view', 'badge.create', 'badge.update', 'badge.delete',
            'materi.view', 'materi.create', 'materi.update', 'materi.delete',
            'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
            'pengguna.view', 'pengguna.create', 'pengguna.update', 'pengguna.delete',
            'bank-soal.view', 'bank-soal.create', 'bank-soal.update', 'bank-soal.delete', 'bank-soal.import', 'bank-soal.export',
            'quiz.view', 'quiz.create', 'quiz.update', 'quiz.delete', 'quiz.start',
            'asesmen.view', 'asesmen.create', 'asesmen.update', 'asesmen.delete', 'asesmen.start', 'asesmen.simulasi',
            'penilaian.view', 'penilaian.grade',
            'sertifikat.view', 'sertifikat.create', 'sertifikat.download', 'sertifikat.print',
            'monitoring.view',
            'laporan.view', 'laporan.export-pdf', 'laporan.export-excel',
            'audit-log.view',
            'notifikasi.view', 'notifikasi.create', 'notifikasi.update', 'notifikasi.delete',
            'pretest.view', 'pretest.start', 'pretest.submit', 'pretest.reset',
            'jadwal.view', 'jadwal.create', 'jadwal.update', 'jadwal.delete',
            'jadwal.bebas',
            'profile.update',
            'password.change',
            'session.manage',
            'pretest.take',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        Permission::whereIn('name', ['learning.access', 'exam.take'])
            ->where('guard_name', 'sanctum')
            ->delete();

        Permission::where('name', 'like', 'exam-schedules.%')
            ->where('guard_name', 'sanctum')
            ->delete();

        Permission::where('guard_name', 'sanctum')
            ->where(function ($query): void {
                $query->whereIn('name', [
                    'asesmen.grade', 'asesmen.review', 'penilaian.update',
                    'opd.import', 'opd.export', 'bidang.import', 'bidang.export',
                    'jabatan.import', 'jabatan.export', 'kompetensi.import', 'kompetensi.export',
                    'level.import', 'level.export', 'walidata.import', 'walidata.export',
                    'penguji.import', 'penguji.export', 'materi.import', 'materi.export',
                ]);
            })
            ->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $roles = [
            'Super Admin' => $permissions,
            'Admin Diskominfo' => array_values(array_filter($permissions, fn (string $permission): bool => $permission !== 'audit-log.view')),
            'Penguji' => [
                // Bank Soal - kelola soal
                'bank-soal.view', 'bank-soal.create', 'bank-soal.update', 'bank-soal.delete', 'bank-soal.import', 'bank-soal.export',
                // Penilaian - nilai essay, approve/tolak, wawancara
                'penilaian.view', 'penilaian.grade',
                // Monitoring - pantau peserta
                'monitoring.view',
                // Referensi saat buat soal (kompetensi & level saja, materi tidak perlu)
                'kompetensi.view', 'level.view',
                // Profil sendiri
                'profile.update', 'password.change',
            ],
            'Walidata' => [
                // Pretest - assessment awal
                'pretest.view', 'pretest.start', 'pretest.submit', 'pretest.take',
                // Materi & Quiz - pembelajaran
                'materi.view', 'quiz.view', 'quiz.start',
                // Asesmen - lihat daftar & ikut (read-only + start)
                'asesmen.view', 'asesmen.start',
                // Sertifikat - lihat & download sendiri
                'sertifikat.view', 'sertifikat.download',
                // Profil sendiri
                'profile.update', 'password.change',
            ],
            'Pimpinan' => [
                // Dashboard - read-only
                'dashboard.view',
                // Monitoring - track progress
                'monitoring.view',
                // Laporan - lihat & export
                'laporan.view', 'laporan.export-pdf', 'laporan.export-excel',
                // Sertifikat - lihat terbit
                'sertifikat.view',
                // Audit log - trail
                'audit-log.view',
                // Profil sendiri
                'profile.update', 'password.change',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'sanctum'])->syncPermissions($rolePermissions);
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

            $role = Role::where('name', $userData['role'])->where('guard_name', 'sanctum')->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }
    }
}
