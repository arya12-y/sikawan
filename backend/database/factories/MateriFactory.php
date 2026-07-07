<?php

namespace Database\Factories;

use App\Models\Kategori;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\Materi;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Materi>
 */
class MateriFactory extends Factory
{
    public function definition(): array
    {
        $jenis = fake()->randomElement(['video', 'pdf', 'presentasi', 'dokumen']);

        return [
            'kompetensi_id' => Kompetensi::factory(),
            'level_id' => Level::factory(),
            'kategori_id' => Kategori::factory(),
            'judul' => fake()->randomElement(['Dasar Pengelolaan Data', 'Validasi Data Sektoral', 'Analisis Data Pemerintahan', 'Keamanan Data Publik']),
            'deskripsi' => fake()->paragraph(),
            'jenis' => $jenis,
            'file_path' => $jenis === 'video' ? null : 'materi/'.fake()->uuid().'.pdf',
            'thumbnail' => 'thumbnails/materi.jpg',
            'url_video' => $jenis === 'video' ? fake()->url() : null,
            'durasi' => fake()->numberBetween(15, 120),
            'urutan' => fake()->numberBetween(1, 20),
            'is_published' => true,
            'published_at' => now(),
            'created_by' => User::factory(),
        ];
    }
}
