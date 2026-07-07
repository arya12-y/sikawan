<?php

namespace Database\Factories;

use App\Models\Kompetensi;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Kompetensi>
 */
class KompetensiFactory extends Factory
{
    public function definition(): array
    {
        $nama = fake()->randomElement(['Pengelolaan Data', 'Analisis Statistik', 'Keamanan Informasi', 'Integrasi Sistem', 'Visualisasi Data']);

        return [
            'kode' => fake()->unique()->bothify('KMP-###'),
            'nama' => $nama,
            'deskripsi' => fake()->sentence(12),
            'domain' => Str::slug($nama),
            'is_active' => true,
        ];
    }
}
