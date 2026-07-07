<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Bidang;
use App\Models\Jabatan;
use App\Models\Kategori;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\Opd;
use App\Models\Penguji;
use App\Models\User;
use App\Models\Walidata;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $opds = [
            ['kode' => 'OPD001', 'nama' => 'Dinas Komunikasi dan Informatika', 'singkatan' => 'Diskominfo'],
            ['kode' => 'OPD002', 'nama' => 'Badan Perencanaan Pembangunan Daerah', 'singkatan' => 'Bappeda'],
            ['kode' => 'OPD003', 'nama' => 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', 'singkatan' => 'BKPSDM'],
            ['kode' => 'OPD004', 'nama' => 'Dinas Pendidikan', 'singkatan' => 'Disdik'],
            ['kode' => 'OPD005', 'nama' => 'Dinas Kesehatan', 'singkatan' => 'Dinkes'],
            ['kode' => 'OPD006', 'nama' => 'Dinas Kependudukan dan Pencatatan Sipil', 'singkatan' => 'Disdukcapil'],
            ['kode' => 'OPD007', 'nama' => 'Dinas Sosial', 'singkatan' => 'Dinsos'],
            ['kode' => 'OPD008', 'nama' => 'Dinas Pekerjaan Umum dan Penataan Ruang', 'singkatan' => 'PUPR'],
            ['kode' => 'OPD009', 'nama' => 'Dinas Perhubungan', 'singkatan' => 'Dishub'],
            ['kode' => 'OPD010', 'nama' => 'Satuan Polisi Pamong Praja', 'singkatan' => 'Satpol PP'],
        ];

        foreach ($opds as $opdData) {
            $opd = Opd::updateOrCreate(['kode' => $opdData['kode']], $opdData + ['is_active' => true]);

            foreach (['Sekretariat', 'Bidang Data dan Statistik', 'Bidang Layanan Digital'] as $bidangName) {
                Bidang::updateOrCreate(
                    ['opd_id' => $opd->id, 'nama' => $bidangName],
                    ['deskripsi' => $bidangName.' '.$opd->singkatan, 'is_active' => true]
                );
            }
        }

        foreach (['Kepala Dinas', 'Sekretaris', 'Kepala Bidang', 'Analis Data', 'Pranata Komputer', 'Staff'] as $index => $jabatanName) {
            Jabatan::updateOrCreate(
                ['nama' => $jabatanName],
                ['level' => $index + 1, 'is_active' => true]
            );
        }

        foreach (['Tata Kelola Data', 'Metadata Statistik', 'Interoperabilitas Data', 'Keamanan Informasi', 'Analisis Data', 'Visualisasi Data', 'Kualitas Data', 'Integrasi Sistem'] as $index => $kompetensiName) {
            Kompetensi::updateOrCreate(
                ['kode' => 'KMP'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                ['nama' => $kompetensiName, 'domain' => 'Kompetensi Data', 'is_active' => true]
            );
        }

        $levels = [
            ['nama' => 'Pemula', 'kode' => 'pemula', 'urutan' => 1, 'nilai_min' => 0, 'nilai_max' => 39, 'warna' => '#ef4444'],
            ['nama' => 'Dasar', 'kode' => 'dasar', 'urutan' => 2, 'nilai_min' => 40, 'nilai_max' => 59, 'warna' => '#f97316'],
            ['nama' => 'Terampil', 'kode' => 'terampil', 'urutan' => 3, 'nilai_min' => 60, 'nilai_max' => 74, 'warna' => '#eab308'],
            ['nama' => 'Mahir', 'kode' => 'mahir', 'urutan' => 4, 'nilai_min' => 75, 'nilai_max' => 89, 'warna' => '#22c55e'],
            ['nama' => 'Ahli', 'kode' => 'ahli', 'urutan' => 5, 'nilai_min' => 90, 'nilai_max' => 100, 'warna' => '#3b82f6'],
        ];

        foreach ($levels as $levelData) {
            Level::updateOrCreate(['kode' => $levelData['kode']], $levelData + ['is_active' => true]);
        }

        foreach ([['Data Explorer', 0], ['Data Analyst', 60], ['Data Champion', 75], ['Data Expert', 90]] as [$badgeName, $nilaiMin]) {
            Badge::updateOrCreate(
                ['nama' => $badgeName],
                ['nilai_min' => $nilaiMin, 'is_active' => true]
            );
        }

        foreach (['Dasar', 'Lanjutan', 'Sertifikasi', 'Panduan Teknis'] as $kategoriName) {
            Kategori::updateOrCreate(
                ['slug' => Str::slug($kategoriName)],
                ['nama' => $kategoriName, 'is_active' => true]
            );
        }

        $opd = Opd::where('kode', 'OPD001')->first();
        $bidang = Bidang::where('opd_id', $opd?->id)->first();
        $jabatan = Jabatan::where('nama', 'Analis Data')->first();
        $level = Level::where('kode', 'pemula')->first();
        $walidataUser = User::where('email', 'walidata@sikawan.test')->first();
        $pengujiUser = User::where('email', 'penguji@sikawan.test')->first();

        if ($walidataUser && $opd && $bidang && $jabatan && $level) {
            Walidata::updateOrCreate(
                ['user_id' => $walidataUser->id],
                [
                    'opd_id' => $opd->id,
                    'bidang_id' => $bidang->id,
                    'jabatan_id' => $jabatan->id,
                    'level_id' => $level->id,
                    'nip' => '198001012010011001',
                    'nilai_kompetensi' => 0,
                    'is_active' => true,
                ]
            );
        }

        if ($pengujiUser) {
            Penguji::updateOrCreate(
                ['user_id' => $pengujiUser->id],
                [
                    'nip' => '197501012005011001',
                    'bidang_keahlian' => 'Tata Kelola Data',
                    'bio' => 'Penguji kompetensi walidata',
                    'is_active' => true,
                ]
            );
        }
    }
}
