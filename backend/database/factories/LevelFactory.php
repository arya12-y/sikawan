<?php

namespace Database\Factories;

use App\Models\Level;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Level>
 */
class LevelFactory extends Factory
{
    public function definition(): array
    {
        $urutan = fake()->numberBetween(1, 5);

        return [
            'nama' => fake()->randomElement(['Pemula', 'Dasar', 'Menengah', 'Mahir', 'Ahli']),
            'kode' => fake()->unique()->bothify('LVL-#'),
            'urutan' => $urutan,
            'nilai_min' => ($urutan - 1) * 20,
            'nilai_max' => min($urutan * 20, 100),
            'warna' => fake()->hexColor(),
            'deskripsi' => fake()->sentence(10),
            'is_active' => true,
        ];
    }
}
