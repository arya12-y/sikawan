<?php

namespace Database\Factories;

use App\Models\Opd;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Opd>
 */
class OpdFactory extends Factory
{
    public function definition(): array
    {
        $nama = fake()->randomElement([
            'Dinas Komunikasi dan Informatika',
            'Badan Perencanaan Pembangunan Daerah',
            'Dinas Pendidikan dan Kebudayaan',
            'Dinas Kesehatan',
            'Badan Kepegawaian dan Pengembangan SDM',
        ]);

        return [
            'kode' => fake()->unique()->numerify('OPD-###'),
            'nama' => $nama,
            'singkatan' => Str::upper(collect(explode(' ', $nama))->map(fn ($kata) => Str::substr($kata, 0, 1))->implode('')),
            'alamat' => fake()->address(),
            'telepon' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'website' => fake()->url(),
            'logo' => 'logos/opd.png',
            'is_active' => true,
        ];
    }
}
