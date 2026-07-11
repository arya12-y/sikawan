<?php

namespace App\Services;

use App\Models\BankSoal;
use App\Models\Level;
use App\Models\PesertaAsesmen;

class AssessmentService
{
    public function calculateAnswerScore(BankSoal $soal, ?string $jawaban): array
    {
        $jenis = strtolower((string) $soal->jenis);
        $benar = in_array($jenis, ['essay', 'esai'], true) ? null : trim((string) $jawaban) === trim((string) $soal->jawaban_benar);
        $nilai = $benar === true ? (float) $soal->bobot : 0.0;

        return ['is_benar' => $benar, 'nilai' => $nilai];
    }

    public function recalculatePeserta(PesertaAsesmen $peserta): PesertaAsesmen
    {
        $peserta->loadMissing('asesmen.bankSoals', 'jawabanPesertas.bankSoal');
        $totalBobot = (float) $peserta->asesmen?->bankSoals->sum(fn ($soal) => (float) $soal->bobot);
        $totalNilai = (float) $peserta->jawabanPesertas->sum(fn ($jawaban) => (float) ($jawaban->nilai ?? 0));
        $nilai = $totalBobot > 0 ? round(($totalNilai / $totalBobot) * 100) : 0;

        $peserta->update([
            'nilai' => $nilai,
            'lulus' => $nilai >= (float) ($peserta->asesmen?->nilai_lulus ?? 0),
        ]);

        return $peserta->refresh();
    }

    public function determineLevel(float $nilai): ?Level
    {
        return Level::query()->where('nilai_min', '<=', $nilai)->where('nilai_max', '>=', $nilai)->first()
            ?? Level::query()->orderByDesc('id')->first();
    }

    public function kategori(float $nilai): string
    {
        return match (true) {
            $nilai >= 90 => 'Ahli',
            $nilai >= 80 => 'Mahir',
            $nilai >= 70 => 'Terampil',
            $nilai >= 60 => 'Dasar',
            default => 'Pemula',
        };
    }
}
