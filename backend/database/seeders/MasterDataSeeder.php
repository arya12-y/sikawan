<?php

namespace Database\Seeders;

use App\Models\Asesmen;
use App\Models\Badge;
use App\Models\BankSoal;
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

        $kompetensis = [
            ['nama' => 'Satu Data Indonesia', 'domain' => 'Perpres 39/2019, Prinsip SDI, Walidata, Produsen Data, Forum SDI'],
            ['nama' => 'Statistik Sektoral', 'domain' => 'Konsep statistik, data sektoral, data spasial, data administrasi'],
            ['nama' => 'Metadata', 'domain' => 'Metadata statistik, indikator, variabel, kegiatan'],
            ['nama' => 'Standar Data', 'domain' => 'Kode referensi, interoperabilitas, standar data'],
            ['nama' => 'Kualitas Data', 'domain' => 'Validitas, konsistensi, akurasi, kelengkapan'],
            ['nama' => 'EPSS', 'domain' => 'Domain, aspek, indikator, evidence'],
            ['nama' => 'Open Data', 'domain' => 'API, CKAN, Open Data'],
            ['nama' => 'Pengelolaan Data', 'domain' => 'SIPD, daftar data, validasi, verifikasi'],
        ];

        foreach ($kompetensis as $index => $kompetensi) {
            Kompetensi::updateOrCreate(
                ['kode' => 'KMP'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                ['nama' => $kompetensi['nama'], 'domain' => $kompetensi['domain'], 'is_active' => true]
            );
        }

        $levels = [
            ['nama' => 'Pemula', 'kode' => 'pemula', 'urutan' => 1, 'nilai_min' => 0, 'nilai_max' => 59, 'warna' => '#ef4444'],
            ['nama' => 'Dasar', 'kode' => 'dasar', 'urutan' => 2, 'nilai_min' => 60, 'nilai_max' => 69, 'warna' => '#f97316'],
            ['nama' => 'Terampil', 'kode' => 'terampil', 'urutan' => 3, 'nilai_min' => 70, 'nilai_max' => 79, 'warna' => '#eab308'],
            ['nama' => 'Mahir', 'kode' => 'mahir', 'urutan' => 4, 'nilai_min' => 80, 'nilai_max' => 89, 'warna' => '#22c55e'],
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
                    'bidang_keahlian' => 'Satu Data Indonesia',
                    'bio' => 'Penguji kompetensi walidata',
                    'is_active' => true,
                ]
            );
        }

        $kompetensi = Kompetensi::where('kode', 'KMP001')->first();
        $levelDasar = Level::where('kode', 'dasar')->first();

        if ($kompetensi && $levelDasar) {
            $questions = [
                [
                    'pertanyaan' => 'Apa tujuan utama Satu Data Indonesia?',
                    'pilihan' => ['Menyatukan prinsip tata kelola data pemerintah', 'Menghapus seluruh data OPD', 'Mengganti seluruh aplikasi daerah', 'Membatasi publikasi data'],
                    'jawaban_benar' => 'Menyatukan prinsip tata kelola data pemerintah',
                ],
                [
                    'pertanyaan' => 'Siapa yang berperan mendukung pengelolaan data pada OPD?',
                    'pilihan' => ['Walidata Pendukung', 'Operator sekolah', 'Bendahara', 'Arsiparis umum'],
                    'jawaban_benar' => 'Walidata Pendukung',
                ],
                [
                    'pertanyaan' => 'Salah satu prinsip Satu Data Indonesia adalah?',
                    'pilihan' => ['Memenuhi standar data', 'Data tidak perlu metadata', 'Data hanya disimpan lokal', 'Data tidak perlu dibagi-pakaikan'],
                    'jawaban_benar' => 'Memenuhi standar data',
                ],
                [
                    'pertanyaan' => 'Metadata digunakan untuk?',
                    'pilihan' => ['Menjelaskan definisi dan struktur data', 'Menghapus data lama', 'Mengubah password akun', 'Membuat sertifikat otomatis'],
                    'jawaban_benar' => 'Menjelaskan definisi dan struktur data',
                ],
                [
                    'pertanyaan' => 'Forum Satu Data Indonesia berfungsi sebagai?',
                    'pilihan' => ['Wadah koordinasi penyelenggaraan data', 'Tempat ujian pegawai', 'Aplikasi absensi', 'Sistem keuangan'],
                    'jawaban_benar' => 'Wadah koordinasi penyelenggaraan data',
                ],
            ];

            $soalIds = collect($questions)->map(function (array $question) use ($kompetensi, $levelDasar, $walidataUser) {
                $soal = BankSoal::updateOrCreate(
                    ['pertanyaan' => $question['pertanyaan']],
                    [
                        'kompetensi_id' => $kompetensi->id,
                        'level_id' => $levelDasar->id,
                        'jenis' => 'pilihan_ganda',
                        'pilihan' => json_encode($question['pilihan']),
                        'jawaban_benar' => $question['jawaban_benar'],
                        'pembahasan' => 'Jawaban mengacu pada konsep dasar Satu Data Indonesia.',
                        'bobot' => 1,
                        'is_active' => true,
                        'created_by' => $walidataUser?->id,
                    ]
                );

                return $soal->id;
            });

            $asesmen = Asesmen::updateOrCreate(
                ['judul' => 'Simulasi Asesmen Satu Data Indonesia'],
                [
                    'deskripsi' => 'Asesmen demo untuk simulasi Walidata sampai mendapatkan sertifikat.',
                    'kompetensi_id' => $kompetensi->id,
                    'level_id' => $levelDasar->id,
                    'jumlah_soal' => 5,
                    'durasi' => 15,
                    'nilai_lulus' => 60,
                    'acak_soal' => true,
                    'acak_jawaban' => true,
                    'status' => 'published',
                    'created_by' => $pengujiUser?->id,
                ]
            );

            $asesmen->bankSoals()->sync($soalIds->mapWithKeys(fn ($soalId, $index) => [$soalId => ['urutan' => $index + 1]])->all());
        }
    }
}
