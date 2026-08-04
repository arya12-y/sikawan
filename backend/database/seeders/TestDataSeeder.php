<?php

namespace Database\Seeders;

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\Bidang;
use App\Models\ExamSchedule;
use App\Models\Jabatan;
use App\Models\Kategori;
use App\Models\Level;
use App\Models\Materi;
use App\Models\Opd;
use App\Models\User;
use App\Models\Walidata;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $creator = User::whereHas('roles', fn ($query) => $query
            ->where('name', 'Super Admin')->where('guard_name', 'sanctum'))
            ->first() ?? User::first();

        if (!$creator) {
            $this->command->warn('TestDataSeeder dilewati: tidak ada user untuk created_by.');
            return;
        }

        $this->seedWalidataAccounts();
        $this->seedMateri($creator->id);
        $this->seedMateriPerLevel($creator->id);
        Materi::where('jenis', 'dokumen')->update(['jenis' => 'pdf']);
        $this->ensureMateriQuizSoals($creator->id);

        $questions = [
            [1, 1, 'Apa tujuan utama prinsip Satu Data Indonesia?', ['Menghasilkan data yang akurat, mutakhir, terpadu, dan dapat dipertanggungjawabkan', 'Menyimpan semua data pada satu server', 'Menghapus seluruh data sektoral', 'Membatasi akses data pemerintah'], 'A'],
            [1, 1, 'Peran Walidata dalam penyelenggaraan SDI adalah...', ['Mengumpulkan pajak daerah', 'Memeriksa, mengelola, dan menyebarluaskan data yang disampaikan produsen data', 'Membuat seluruh data tanpa produsen data', 'Menetapkan anggaran statistik'], 'B'],
            [1, 2, 'Salah satu standar data yang wajib digunakan untuk pertukaran data adalah...', ['Definisi dan satuan yang jelas', 'Warna tabel', 'Nama file yang panjang', 'Ukuran monitor'], 'A'],
            [1, 2, 'Forum Satu Data Indonesia digunakan terutama untuk...', ['Koordinasi perencanaan dan penyelesaian isu data', 'Mengganti aplikasi perkantoran', 'Menyusun jadwal cuti', 'Menghapus metadata'], 'A'],
            [1, 3, 'Data prioritas ditetapkan dengan mempertimbangkan...', ['Kebutuhan pembangunan dan prioritas nasional/daerah', 'Jumlah warna grafik', 'Jenis perangkat pengguna', 'Ukuran basis data'], 'A'],
            [2, 1, 'Statistik sektoral adalah statistik yang dimanfaatkan untuk...', ['Memenuhi kebutuhan instansi dalam penyelenggaraan tugasnya', 'Menggantikan sensus penduduk', 'Mencatat kata sandi pengguna', 'Menentukan desain logo'], 'A'],
            [2, 1, 'Produsen data sektoral bertanggung jawab untuk...', ['Menghasilkan data sesuai standar yang ditetapkan', 'Menyembunyikan seluruh data', 'Mengubah data setelah publikasi tanpa catatan', 'Menghapus sumber data'], 'A'],
            [2, 2, 'Indikator statistik yang baik harus memiliki...', ['Definisi operasional dan metode pengukuran yang jelas', 'Nama yang selalu berubah', 'Nilai tanpa satuan', 'Sumber yang tidak diketahui'], 'A'],
            [2, 2, 'Validasi data statistik dilakukan untuk...', ['Memastikan data sesuai aturan, logika, dan sumbernya', 'Memperbesar ukuran file', 'Mengganti periode rilis', 'Menghilangkan catatan metodologi'], 'A'],
            [2, 3, 'Koordinasi statistik sektoral membantu mencegah...', ['Duplikasi kegiatan dan perbedaan definisi indikator', 'Penggunaan metadata', 'Pencatatan sumber data', 'Pemeriksaan kualitas'], 'A'],
            [3, 1, 'Metadata adalah...', ['Informasi yang menjelaskan karakteristik dan konteks suatu data', 'Data yang sudah dihapus', 'Kode rahasia aplikasi', 'Daftar pengguna sistem'], 'A'],
            [3, 1, 'Metadata kegiatan statistik paling tepat menjelaskan...', ['Tujuan, rancangan, dan pelaksanaan kegiatan statistik', 'Warna dashboard', 'Daftar perangkat keras', 'Password operator'], 'A'],
            [3, 2, 'Contoh elemen metadata variabel adalah...', ['Nama, definisi, klasifikasi, dan satuan', 'Nama ruangan dan nomor meja', 'Warna ikon aplikasi', 'Jadwal rapat'], 'A'],
            [4, 1, 'Standar data diperlukan agar...', ['Data konsisten dan mudah dibandingkan serta diintegrasikan', 'Semua data menjadi rahasia', 'Pengumpulan data tidak terdokumentasi', 'Setiap instansi memakai istilah berbeda'], 'A'],
            [4, 2, 'Satuan untuk indikator jumlah penduduk biasanya adalah...', ['Jiwa', 'Kilogram per meter', 'Persen per jam', 'Rupiah per liter'], 'A'],
            [4, 3, 'Definisi operasional berfungsi untuk...', ['Menjelaskan cara memahami dan mengukur suatu konsep', 'Mengatur hak akses jaringan', 'Menentukan format gambar', 'Menghapus nilai kosong'], 'A'],
            [5, 1, 'Kelengkapan data mengukur...', ['Ketersediaan nilai atau atribut yang seharusnya terisi', 'Kecepatan internet', 'Jumlah warna grafik', 'Lama rapat'], 'A'],
            [5, 2, 'Konsistensi data berarti...', ['Tidak terdapat pertentangan antar-record, periode, atau sumber', 'Data selalu bertambah setiap hari', 'Data hanya boleh berupa angka', 'Data tidak memiliki metadata'], 'A'],
            [6, 1, 'EPSS merupakan singkatan dari...', ['Evaluasi Penyelenggaraan Statistik Sektoral', 'Evaluasi Pengadaan Sistem Sektoral', 'Ekspor Publikasi Statistik Satuan', 'Elektronik Pengelolaan Sumber Sistem'], 'A'],
            [6, 2, 'Salah satu manfaat EPSS adalah...', ['Menilai tingkat kematangan penyelenggaraan statistik sektoral', 'Menghapus semua indikator', 'Mengganti produsen data', 'Membatasi interoperabilitas'], 'A'],
            [7, 1, 'Open data yang baik seharusnya...', ['Mudah diakses, digunakan kembali, dan memiliki lisensi yang jelas', 'Hanya tersedia dalam gambar hasil pindai', 'Tidak memiliki sumber', 'Selalu berbayar'], 'A'],
            [7, 3, 'Format yang umum dipilih untuk pertukaran data tabular adalah...', ['CSV', 'BMP', 'MP3', 'EXE'], 'A'],
            [8, 2, 'Pengelolaan data mencakup kegiatan...', ['Perencanaan, pengumpulan, penyimpanan, pemeliharaan, dan pemanfaatan', 'Penghapusan tanpa prosedur', 'Penggantian semua sistem setiap bulan', 'Pembuatan desain poster'], 'A'],
            [8, 3, 'Pengendalian versi data penting untuk...', ['Melacak perubahan dan menjaga keterlacakan data', 'Mengurangi kebutuhan dokumentasi', 'Menghilangkan audit trail', 'Membuat definisi berubah otomatis'], 'A'],
            [3, 2, 'Metadata yang lengkap membantu pengguna untuk...', ['Menafsirkan data secara tepat dan menggunakannya kembali', 'Mengubah sumber data tanpa catatan', 'Menghapus definisi variabel', 'Menyembunyikan periode data'], 'A'],
            [4, 2, 'Kode referensi dalam standar data digunakan untuk...', ['Menyeragamkan nilai dan klasifikasi yang digunakan', 'Mengganti nama produsen data', 'Menghapus satuan pengukuran', 'Membatasi pemanfaatan data'], 'A'],
            [5, 3, 'Akurasi data menunjukkan...', ['Kesesuaian nilai data dengan kondisi atau sumber yang benar', 'Jumlah kolom dalam tabel', 'Kecepatan publikasi', 'Jumlah pengguna aplikasi'], 'A'],
        ];

        $soals = collect();
        foreach ($questions as [$kompetensi, $level, $pertanyaan, $pilihan, $jawaban]) {
            $soals->push(BankSoal::firstOrCreate(
                ['pertanyaan' => $pertanyaan],
                ['kompetensi_id' => $kompetensi, 'level_id' => $level, 'jenis' => 'pilihan_ganda', 'tipe' => ['quiz', 'pretest', 'asesmen'], 'pilihan' => $pilihan, 'jawaban_benar' => $jawaban, 'pembahasan' => 'Jawaban benar: '.$jawaban.'. Konsep ini merupakan bagian penting dalam penerapan Satu Data Indonesia.', 'bobot' => 1.00, 'is_active' => true, 'created_by' => $creator->id]
            ));
        }

        foreach ([
            [3, 'Jelaskan mengapa metadata penting dalam pertukaran data statistik.'],
            [4, 'Jelaskan hubungan standar data dengan interoperabilitas antarinstansi.'],
            [5, 'Sebutkan langkah yang dapat dilakukan untuk meningkatkan kualitas data.'],
            [6, 'Jelaskan manfaat hasil EPSS bagi pengelola statistik sektoral.'],
            [7, 'Apa karakteristik dataset yang layak dipublikasikan sebagai open data?'],
            [8, 'Jelaskan praktik pengelolaan data yang menjaga keamanan dan keterlacakan.'],
        ] as [$kompetensi, $pertanyaan]) {
            $soals->push(BankSoal::firstOrCreate(
                ['pertanyaan' => $pertanyaan],
                ['kompetensi_id' => $kompetensi, 'level_id' => 3, 'jenis' => 'essay', 'tipe' => ['asesmen'], 'pilihan' => null, 'jawaban_benar' => null, 'pembahasan' => 'Nilai berdasarkan ketepatan konsep, contoh, dan kelengkapan penjelasan.', 'bobot' => 1.00, 'is_active' => true, 'created_by' => $creator->id]
            ));
        }

        $now = now();
        ExamSchedule::updateOrCreate(['title' => 'Jadwal Ujian Satu Data Aktif'], [
            'pretest_start' => $now->copy()->subDays(5), 'pretest_end' => $now->copy()->subDays(3),
            'learning_start' => $now->copy()->subDays(3), 'learning_end' => $now->copy()->subDays(1),
            'exam_start' => $now->copy()->subDay(), 'exam_end' => $now->copy()->addDays(7),
            'kompetensi_ids' => [1, 2], 'pretest_jumlah_per_kompetensi' => 5, 'pretest_durasi' => 30, 'is_active' => true, 'status' => 'published',
        ]);
        ExamSchedule::updateOrCreate(['title' => 'Jadwal Ujian Satu Data Mendatang'], [
            'pretest_start' => $now->copy()->addDays(7), 'pretest_end' => $now->copy()->addDays(9),
            'learning_start' => $now->copy()->addDays(10), 'learning_end' => $now->copy()->addDays(16),
            'exam_start' => $now->copy()->addDays(17), 'exam_end' => $now->copy()->addDays(24),
            'kompetensi_ids' => [3, 4, 5], 'pretest_jumlah_per_kompetensi' => 3, 'pretest_durasi' => 25, 'is_active' => false, 'status' => 'draft',
        ]);

        $pilihanGanda = $soals->where('jenis', 'pilihan_ganda');
        $essay = $soals->where('jenis', 'essay');
        $this->seedAsesmen('Asesmen Kompetensi Satu Data', [1, 2], 3, 10, 30, 60, $pilihanGanda->whereIn('kompetensi_id', [1, 2])->take(10)->concat($essay->whereIn('kompetensi_id', [1, 2])->take(2)->isNotEmpty() ? $essay->whereIn('kompetensi_id', [1, 2])->take(2) : $essay->take(1)), $creator->id);
        $this->seedAsesmen('Asesmen Statistik Sektoral', [2, 5], 2, 8, 25, 65, $pilihanGanda->whereIn('kompetensi_id', [2, 5])->take(8), $creator->id);
        $this->seedAsesmen('Asesmen Metadata & Standar Data', [3, 4], 2, 6, 20, 60, $pilihanGanda->whereIn('kompetensi_id', [3, 4])->take(6)->concat($essay->whereIn('kompetensi_id', [3, 4])->take(2)), $creator->id);
    }

    private function seedMateri(int $creatorId): void
    {
        $kompetensis = [1, 2, 3, 4, 5, 6, 7, 8];
        $levels = Level::query()->orderBy('id')->get();
        $kategoris = Kategori::query()->orderBy('id')->get();

        if ($levels->isEmpty() || $kategoris->isEmpty()) {
            $this->command->warn('Materi test data dilewati: master level atau kategori belum tersedia.');
            return;
        }

        $materi = [
            ['Dasar-Dasar Satu Data Indonesia', 'video', 1, 1, 1, 'Pengenalan prinsip dan manfaat Satu Data Indonesia.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 12],
            ['Tata Kelola Data Pemerintah', 'presentasi', 1, 2, 2, 'Kerangka peran, tanggung jawab, dan koordinasi pengelolaan data pemerintah.', null, null],
            ['Konsep Statistik Sektoral', 'video', 2, 1, 1, 'Memahami karakteristik dan pemanfaatan statistik sektoral.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 15],
            ['Standar Metadata Statistik', 'pdf', 3, 2, 4, 'Panduan elemen metadata kegiatan dan variabel statistik.', null, null],
            ['Penjaminan Kualitas Data', 'presentasi', 5, 3, 2, 'Teknik pemeriksaan akurasi, kelengkapan, konsistensi, dan ketepatan waktu data.', null, null],
            ['Pengenalan EPSS', 'pdf', 6, 2, 3, 'Ringkasan indikator dan tahapan Evaluasi Penyelenggaraan Statistik Sektoral.', null, null],
            ['Open Data untuk Publik', 'video', 7, 1, 1, 'Prinsip publikasi dataset yang mudah diakses dan digunakan kembali.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 10],
            ['Siklus Pengelolaan Data', 'dokumen', 8, 3, 4, 'Dokumen rujukan siklus perencanaan, pengumpulan, penyimpanan, dan pemanfaatan data.', null, null],
            ['Validasi dan Integrasi Data Lintas Instansi', 'video', 4, 3, 2, 'Praktik validasi dan integrasi data menggunakan standar yang sama.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 18],
            ['Perencanaan Kegiatan Statistik Berkualitas', 'pdf', 2, 3, 4, 'Langkah menyusun kebutuhan, metodologi, dan rencana rilis statistik sektoral.', null, null],
        ];

        foreach ($materi as $index => [$judul, $jenis, $kompetensi, $level, $kategori, $deskripsi, $urlVideo, $durasi]) {
            Materi::firstOrCreate(
                ['judul' => $judul],
                [
                    'kompetensi_id' => $kompetensis[$kompetensi - 1],
                    'level_id' => $levels->get($level - 1)?->id ?? $levels->first()->id,
                    'kategori_id' => $kategoris->get($kategori - 1)?->id ?? $kategoris->first()->id,
                    'deskripsi' => $deskripsi,
                    'jenis' => $jenis,
                    'file_path' => $jenis === 'video' ? null : 'materi/test-data/'.str($judul)->slug().'.'.($jenis === 'pdf' ? 'pdf' : ($jenis === 'presentasi' ? 'pptx' : 'docx')),
                    'thumbnail' => null,
                    'url_video' => $urlVideo,
                    'durasi' => $durasi,
                    'urutan' => $index + 1,
                    'is_published' => true,
                    'published_at' => now(),
                    'created_by' => $creatorId,
                ]
            );
        }
    }

    private function seedMateriPerLevel(int $creatorId): void
    {
        $levels = Level::query()->orderBy('id')->get();
        $kategoris = Kategori::query()->orderBy('id')->get();
        if ($levels->count() < 5 || $kategoris->isEmpty()) {
            $this->command->warn('Materi per level dilewati: butuh 5 level dan kategori.');
            return;
        }

        // Repair legacy/sample records that were created without a level.
        foreach (Materi::whereNull('level_id')->orderBy('id')->get() as $index => $item) {
            $item->update(['level_id' => $levels[$index % 5]->id]);
        }
        Materi::where('is_published', '!=', true)->orWhereNull('published_at')->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        $materials = [
            [1, 1, 'Peta Jalan Satu Data bagi Pemula', 'video', 'Memahami langkah awal membangun tata kelola Satu Data.', 11],
            [1, 2, 'Mengenal Peran Walidata dan Produsen Data', 'pdf', 'Materi dasar pembagian peran dalam penyelenggaraan Satu Data.', null],
            [1, 3, 'Kamus Data Pemerintah: Istilah Dasar', 'presentasi', 'Pengenalan istilah umum, atribut, dan satuan data pemerintah.', null],
            [2, 1, 'Mengidentifikasi Kebutuhan Statistik Sektoral', 'video', 'Latihan merumuskan kebutuhan statistik berdasarkan tugas instansi.', 14],
            [2, 3, 'Praktik Menyusun Indikator Statistik', 'dokumen', 'Panduan menyusun indikator dengan definisi operasional yang jelas.', null],
            [2, 4, 'Alur Validasi Data Sektoral', 'pdf', 'Tahapan pemeriksaan aturan, logika, dan sumber data sektoral.', null],
            [3, 2, 'Membangun Metadata Variabel', 'video', 'Praktik mendokumentasikan nama, definisi, klasifikasi, dan satuan variabel.', 17],
            [3, 4, 'Integrasi Data Berbasis Standar', 'presentasi', 'Penerapan standar data dan kode referensi untuk integrasi lintas sumber.', null],
            [3, 5, 'Audit Kualitas Dataset', 'pdf', 'Metode menilai akurasi, kelengkapan, konsistensi, dan ketepatan waktu.', null],
            [4, 6, 'Strategi Peningkatan Nilai EPSS', 'video', 'Strategi peningkatan kematangan statistik sektoral melalui hasil EPSS.', 19],
            [4, 7, 'Merancang Katalog Open Data', 'presentasi', 'Praktik menyiapkan katalog dataset publik yang mudah ditemukan.', null],
            [4, 8, 'Manajemen Perubahan Data', 'dokumen', 'Pengendalian versi, audit trail, dan pengelolaan perubahan dataset.', null],
            [5, 3, 'Metadata untuk Interoperabilitas Nasional', 'video', 'Pendalaman metadata untuk pertukaran data antarplatform pemerintah.', 21],
            [5, 5, 'Kerangka Penjaminan Mutu Statistik', 'pdf', 'Kerangka pengendalian mutu untuk kegiatan statistik tingkat lanjut.', null],
            [5, 8, 'Arsitektur Tata Kelola Data Strategis', 'presentasi', 'Materi ahli mengenai tata kelola, risiko, dan keberlanjutan data.', null],
        ];

        foreach ($materials as $index => [$level, $kompetensi, $judul, $jenis, $deskripsi, $durasi]) {
            Materi::firstOrCreate(
                ['judul' => $judul],
                [
                    'kompetensi_id' => $kompetensi,
                    'level_id' => $levels[$level - 1]->id,
                    'kategori_id' => $kategoris[$index % $kategoris->count()]->id,
                    'deskripsi' => $deskripsi,
                    'jenis' => $jenis,
                    'file_path' => in_array($jenis, ['video'], true) ? null : 'materi/test-data/'.str($judul)->slug().'.'.($jenis === 'pdf' ? 'pdf' : ($jenis === 'presentasi' ? 'pptx' : 'docx')),
                    'url_video' => $jenis === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
                    'durasi' => $durasi,
                    'urutan' => $index + 1,
                    'is_published' => true,
                    'published_at' => now(),
                    'created_by' => $creatorId,
                ]
            );
        }
    }

    private function ensureMateriQuizSoals(int $creatorId): void
    {
        foreach (Materi::where('is_published', true)->get() as $materi) {
            if ($materi->soals()->count() > 0) {
                continue;
            }

            $soal = BankSoal::where('kompetensi_id', $materi->kompetensi_id)
                ->where('level_id', $materi->level_id)
                ->where('is_active', true)
                ->whereJsonContains('tipe', 'quiz')
                ->first()
                ?? BankSoal::where('kompetensi_id', $materi->kompetensi_id)
                    ->where('is_active', true)
                    ->whereJsonContains('tipe', 'quiz')
                    ->first();

            if (!$soal) {
                $soal = BankSoal::firstOrCreate(
                    ['pertanyaan' => 'Apa pemahaman utama yang diperoleh dari materi "'.$materi->judul.'"?'],
                    [
                        'kompetensi_id' => $materi->kompetensi_id,
                        'level_id' => $materi->level_id,
                        'jenis' => 'pilihan_ganda',
                        'tipe' => ['quiz'],
                        'pilihan' => ['Memahami konsep dan penerapannya', 'Mengabaikan materi', 'Menghapus metadata', 'Mengubah sumber data tanpa validasi'],
                        'jawaban_benar' => 'A',
                        'pembahasan' => 'Materi dipahami dengan menguasai konsep dan menerapkannya sesuai konteks.',
                        'bobot' => 1.00,
                        'is_active' => true,
                        'created_by' => $creatorId,
                    ]
                );
            }

            $materi->soals()->sync([$soal->id]);
        }
    }

    private function seedWalidataAccounts(): void
    {
        $role = Role::where('name', 'Walidata')->where('guard_name', 'sanctum')->first();
        $opds = Opd::query()->orderBy('id')->get();
        $bidangs = Bidang::query()->orderBy('id')->get();
        $jabatans = Jabatan::query()->orderBy('id')->get();
        $levels = Level::query()->orderBy('id')->get();

        if ($opds->isEmpty()) {
            $this->command->warn('Walidata test accounts dilewati: master OPD belum tersedia.');
            return;
        }
        if (!$role) {
            $this->command->warn('Role Walidata guard sanctum tidak ditemukan; akun dibuat tanpa role.');
        }

        $accounts = [
            ['Budi Santoso', 'budi.santoso@sikawan.test', '198503152010011001', 72],
            ['Siti Nurhaliza', 'siti.nurhaliza@sikawan.test', '198706222011012002', 81],
            ['Agus Prasetyo', 'agus.prasetyo@sikawan.test', '198911082012031003', 67],
            ['Dewi Anggraeni', 'dewi.anggraeni@sikawan.test', '198604192010042004', 78],
            ['Ririn Safitri', 'ririn.safitri@sikawan.test', '199002272013051005', 84],
        ];

        foreach ($accounts as $index => [$name, $email, $nip, $nilai]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => Hash::make('password'), 'is_active' => true]
            );
            if ($role) {
                $user->roles()->sync([$role->id]);
            }

            Walidata::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'opd_id' => $opds[$index % $opds->count()]->id,
                    'bidang_id' => $bidangs->isNotEmpty() ? $bidangs[$index % $bidangs->count()]->id : null,
                    'jabatan_id' => $jabatans->isNotEmpty() ? $jabatans[$index % $jabatans->count()]->id : null,
                    'level_id' => $levels->isNotEmpty() ? $levels[$index % $levels->count()]->id : null,
                    'nip' => $nip,
                    'nilai_kompetensi' => $nilai,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedAsesmen(string $judul, array $kompetensiIds, int $level, int $jumlah, int $durasi, int $lulus, $soals, int $creatorId): void
    {
        $asesmen = Asesmen::updateOrCreate(['judul' => $judul], ['deskripsi' => 'Data uji untuk '.$judul, 'kompetensi_ids' => $kompetensiIds, 'kompetensi_id' => $kompetensiIds[0], 'level_id' => $level, 'jumlah_soal' => $jumlah, 'durasi' => $durasi, 'nilai_lulus' => $lulus, 'acak_soal' => true, 'acak_jawaban' => false, 'status' => 'published', 'created_by' => $creatorId]);
        $ids = $soals->pluck('id')->values();
        $asesmen->bankSoals()->sync($ids->mapWithKeys(fn ($id, $index) => [$id => ['urutan' => $index + 1]])->all());
        $asesmen->update(['jumlah_soal' => $ids->count()]);
    }
}
