<?php

namespace Database\Factories;

use App\Models\Kategori;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Kategori>
 */
class KategoriFactory extends Factory
{
    public function definition(): array
    {
        $nama = fake()->randomElement(['Modul Dasar', 'Panduan Teknis', 'Studi Kasus', 'Materi Video', 'Evaluasi Mandiri']);

        return [
            'nama' => $nama,
            'slug' => Str::slug($nama.'-'.fake()->unique()->numberBetween(1, 999)),
            'deskripsi' => fake()->sentence(10),
            'is_active' => true,
        ];
    }
}
