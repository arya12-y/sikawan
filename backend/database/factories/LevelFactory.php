<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Level>
 */
class LevelFactory extends Factory
{
    public function definition(): array
    {
        $levels = [
            ['Pemula', 0, 59],
            ['Dasar', 60, 69],
            ['Terampil', 70, 79],
            ['Mahir', 80, 89],
            ['Ahli', 90, 100],
        ];
        [$nama, $min, $max] = fake()->randomElement($levels);

        return [
            'nama' => $nama,
            'kode' => fake()->unique()->bothify('LVL-#'),
            'urutan' => array_search($nama, array_column($levels, 0), true) + 1,
            'nilai_min' => $min,
            'nilai_max' => $max,
            'warna' => fake()->hexColor(),
            'deskripsi' => fake()->sentence(10),
            'is_active' => true,
        ];
    }
}
