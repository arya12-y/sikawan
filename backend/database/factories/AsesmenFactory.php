<?php

namespace Database\Factories;

use App\Models\Asesmen;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asesmen>
 */
class AsesmenFactory extends Factory
{
    public function definition(): array
    {
        $mulai = fake()->dateTimeBetween('-1 week', '+1 month');

        return [
            'judul' => fake()->randomElement(['Asesmen Kompetensi Data', 'Uji Pemahaman Statistik Sektoral', 'Evaluasi Keamanan Informasi']),
            'deskripsi' => fake()->paragraph(),
            'kompetensi_id' => Kompetensi::factory(),
            'level_id' => Level::factory(),
            'jumlah_soal' => fake()->numberBetween(10, 50),
            'durasi' => fake()->numberBetween(30, 120),
            'nilai_lulus' => fake()->randomFloat(2, 60, 80),
            'acak_soal' => true,
            'acak_jawaban' => true,
            'tanggal_mulai' => $mulai,
            'tanggal_selesai' => fake()->dateTimeBetween($mulai, '+2 months'),
            'status' => fake()->randomElement(['draft', 'published', 'ongoing', 'finished']),
            'created_by' => User::factory(),
        ];
    }
}
