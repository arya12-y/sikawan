<?php

namespace Database\Factories;

use App\Models\Badge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Badge>
 */
class BadgeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nama' => fake()->randomElement(['Pembelajar Aktif', 'Ahli Data', 'Lulus Cepat', 'Skor Terbaik', 'Konsisten']),
            'icon' => fake()->randomElement(['award', 'star', 'shield', 'trophy', 'medal']),
            'deskripsi' => fake()->sentence(10),
            'nilai_min' => fake()->randomFloat(2, 60, 95),
            'is_active' => true,
        ];
    }
}
