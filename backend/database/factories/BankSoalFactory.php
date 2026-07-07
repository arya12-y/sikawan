<?php

namespace Database\Factories;

use App\Models\BankSoal;
use App\Models\Kompetensi;
use App\Models\Level;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BankSoal>
 */
class BankSoalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kompetensi_id' => Kompetensi::factory(),
            'level_id' => Level::factory(),
            'jenis' => 'pilihan_ganda',
            'pertanyaan' => fake()->randomElement([
                'Apa tujuan utama validasi data sektoral?',
                'Indikator apa yang digunakan untuk menilai kualitas data?',
                'Bagaimana cara memastikan keamanan data pribadi?',
            ]),
            'pilihan' => ['A' => 'Akurasi data', 'B' => 'Duplikasi data', 'C' => 'Penghapusan arsip', 'D' => 'Pengabaian metadata'],
            'jawaban_benar' => 'A',
            'pembahasan' => fake()->sentence(14),
            'bobot' => fake()->randomFloat(2, 1, 5),
            'is_active' => true,
            'created_by' => User::factory(),
        ];
    }
}
