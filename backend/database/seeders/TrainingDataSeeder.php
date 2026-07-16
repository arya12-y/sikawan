<?php

namespace Database\Seeders;

use App\Models\MateriProgress;
use App\Models\NilaiKompetensi;
use App\Models\User;
use App\Models\Materi;
use App\Models\Walidata;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\Kategori;
use Illuminate\Database\Seeder;

class TrainingDataSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereHas('walidata')->get();
        $walidatas = Walidata::all();
        $kompetensis = Kompetensi::all();

        // --- BUAT SAMPLE MATERI AGAR PROGRESS BISA DI-SEED ---
        $materis = Materi::all();
        if ($materis->isEmpty()) {
            $kompetensi = $kompetensis->first();
            $level = Level::first();
            $kategori = Kategori::first();
            $creator = User::role('Super Admin')->first() ?? User::first();

            $sampleMateris = [
                ['judul' => 'Pengantar Satu Data Indonesia', 'jenis' => 'video', 'deskripsi' => 'Video pengantar konsep SDI', 'url_video' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'durasi' => 10],
                ['judul' => 'Modul Statistik Sektoral', 'jenis' => 'pdf', 'deskripsi' => 'Panduan statistik sektoral untuk Walidata'],
                ['judul' => 'Presentasi Metadata', 'jenis' => 'presentasi', 'deskripsi' => 'Slide pengenalan metadata statistik'],
                ['judul' => 'Panduan Standar Data', 'jenis' => 'pdf', 'deskripsi' => 'Dokumen standar data pemerintah'],
                ['judul' => 'Video Kualitas Data', 'jenis' => 'video', 'deskripsi' => 'Cara memeriksa kualitas data', 'url_video' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'durasi' => 15],
            ];

            foreach ($sampleMateris as $data) {
                $materis->push(Materi::create([
                    'kompetensi_id' => $kompetensi?->id,
                    'level_id' => $level?->id,
                    'kategori_id' => $kategori?->id,
                    'judul' => $data['judul'],
                    'jenis' => $data['jenis'],
                    'deskripsi' => $data['deskripsi'],
                    'url_video' => $data['url_video'] ?? null,
                    'durasi' => $data['durasi'] ?? null,
                    'is_published' => true,
                    'created_by' => $creator?->id,
                ]));
            }

            $materis = Materi::all(); // re-fetch
            $this->command->info('Materi: '.$materis->count().' sample records created.');
        }

        // --- MATERI PROGRESS ---
        if ($users->isNotEmpty() && $materis->isNotEmpty()) {
            $bar = $this->command->getOutput()->createProgressBar($users->count());
            $bar->start();

            foreach ($users as $user) {
                foreach ($materis->random(min($materis->count(), rand(1, 5))) as $materi) {
                    $isCompleted = (bool) rand(0, 1);
                    MateriProgress::updateOrCreate(
                        ['user_id' => $user->id, 'materi_id' => $materi->id],
                        [
                            'progress' => $isCompleted ? 100 : rand(10, 90),
                            'is_completed' => $isCompleted,
                            'completed_at' => $isCompleted ? now()->subDays(rand(0, 30)) : null,
                        ]
                    );
                }
                $bar->advance();
            }

            $bar->finish();
            $this->command->newLine();
            $this->command->info('MateriProgress: '.MateriProgress::count().' records created.');
        } else {
            $this->command->warn('Lewati MateriProgress — butuh data User+Walidata dan Materi.');
        }

        // --- NILAI KOMPETENSI ---
        if ($walidatas->isEmpty() || $kompetensis->isEmpty()) {
            $this->command->warn('Lewati NilaiKompetensi — butuh data Walidata dan Kompetensi.');
            return;
        }

        $bar2 = $this->command->getOutput()->createProgressBar($walidatas->count());
        $bar2->start();

        foreach ($walidatas as $walidata) {
            foreach ($kompetensis->random(min($kompetensis->count(), rand(1, 3))) as $kompetensi) {
                $nilai = round(rand(2000, 9500) / 100, 2);
                NilaiKompetensi::updateOrCreate(
                    ['user_id' => $walidata->user_id, 'kompetensi_id' => $kompetensi->id],
                    [
                        'nilai' => $nilai,
                        'kategori' => 'Seed Data',
                    ]
                );
            }

            $avg = NilaiKompetensi::where('user_id', $walidata->user_id)->avg('nilai');
            $walidata->update(['nilai_kompetensi' => round($avg ?? 0, 2)]);

            $bar2->advance();
        }

        $bar2->finish();
        $this->command->newLine();
        $this->command->info('NilaiKompetensi: '.NilaiKompetensi::count().' records created.');
        $this->command->info('Selesai! Buka dashboard untuk melihat grafik.');
    }
}
