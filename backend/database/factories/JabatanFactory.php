<?php

namespace Database\Factories;

use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Jabatan>
 */
class JabatanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nama' => fake()->randomElement(['Analis Data', 'Pranata Komputer', 'Statistisi', 'Pengelola Data', 'Administrator Sistem']),
            'deskripsi' => fake()->sentence(10),
            'level' => fake()->numberBetween(1, 5),
            'is_active' => true,
        ];
    }
}
