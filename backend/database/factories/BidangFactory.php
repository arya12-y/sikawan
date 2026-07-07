<?php

namespace Database\Factories;

use App\Models\Bidang;
use App\Models\Opd;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bidang>
 */
class BidangFactory extends Factory
{
    public function definition(): array
    {
        $nama = fake()->randomElement([
            'Bidang Aplikasi Informatika',
            'Bidang Statistik Sektoral',
            'Bidang Persandian dan Keamanan Informasi',
            'Bidang Infrastruktur TIK',
            'Bidang Tata Kelola Data',
        ]);

        return [
            'opd_id' => Opd::factory(),
            'nama' => $nama,
            'deskripsi' => fake()->sentence(12),
            'is_active' => true,
        ];
    }
}
