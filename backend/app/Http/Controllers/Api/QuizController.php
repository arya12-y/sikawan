<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function start(Request $request)
    {
        $user = $request->user();
        $level = $user->walidata?->level;

        $jumlah = (int) $request->query('jumlah', 10);
        $jumlah = max(1, min(50, $jumlah));

        $query = BankSoal::where('is_active', true)->whereJsonContains('tipe', 'quiz');

        if ($level) {
            $levelIds = \App\Models\Level::where('urutan', '<=', $level->urutan)->pluck('id');
            $query->whereIn('level_id', $levelIds);
        }

        $tersedia = (clone $query)->count();
        $ambil = min($jumlah, $tersedia);

        $soals = $query->inRandomOrder()->limit($ambil)->get([
            'id', 'kompetensi_id', 'jenis', 'pertanyaan', 'pilihan', 'bobot',
        ])->each(function ($soal) {
            if (is_array($soal->pilihan) && count($soal->pilihan) > 1) {
                $pilihan = $soal->pilihan;
                shuffle($pilihan);
                $soal->pilihan = $pilihan;
            }
        });

        if ($soals->isEmpty()) {
            return response()->json(['message' => 'Belum ada soal tersedia'], 404);
        }

        $sesiId = Str::uuid()->toString();

        return response()->json([
            'sesi_id' => $sesiId,
            'soals' => $soals->toArray(),
            'total' => $soals->count(),
            'tersedia' => $tersedia,
        ]);
    }

    public function check(Request $request)
    {
        $data = $request->validate([
            'soal_id' => ['required', 'exists:bank_soals,id'],
            'jawaban' => ['nullable', 'string'],
        ]);

        $soal = BankSoal::findOrFail($data['soal_id']);
        $jawabanUser = trim($data['jawaban'] ?? '');
        $jawabanRef = trim($soal->jawaban_benar ?? '');

        if ($soal->jenis === 'pilihan_ganda') {
            $benar = $this->isJawabanQuizBenar($soal, $jawabanUser);
            $jawabanBenar = $this->jawabanBenarText($soal);
            return response()->json([
                'benar' => $benar,
                'jawaban_benar' => $jawabanBenar,
                'pembahasan' => $soal->pembahasan,
                'jenis' => 'pilihan_ganda',
            ]);
        }

        if (!empty($jawabanUser) && !empty($jawabanRef)) {
            similar_text($jawabanUser, $jawabanRef, $similarity);
            $similarity = $similarity / 100;
            $benar = $similarity >= 0.7;
        } else {
            $benar = false;
        }

        return response()->json([
            'benar' => $benar,
            'jenis' => 'essay',
            'jawaban_benar' => $jawabanRef,
            'pembahasan' => $soal->pembahasan,
        ]);
    }

    private function isJawabanQuizBenar(BankSoal $soal, string $jawaban): bool
    {
        $jawaban = trim($jawaban);
        $kunci = trim((string) ($soal->jawaban_benar ?? ''));
        if (strcasecmp($jawaban, $kunci) === 0) return true;

        $pilihan = is_array($soal->pilihan) ? $soal->pilihan : (json_decode((string) $soal->pilihan, true) ?? []);
        $huruf = ['A', 'B', 'C', 'D', 'E'];
        $indeksKunci = array_search(strtoupper($kunci), $huruf, true);
        $indeksJawab = array_search(strtoupper($jawaban), $huruf, true);

        if ($indeksKunci !== false && isset($pilihan[$indeksKunci]) && strcasecmp($jawaban, trim((string) $pilihan[$indeksKunci])) === 0) return true;
        return $indeksJawab !== false && isset($pilihan[$indeksJawab]) && strcasecmp($kunci, trim((string) $pilihan[$indeksJawab])) === 0;
    }

    private function jawabanBenarText(BankSoal $soal): string
    {
        $kunci = trim((string) ($soal->jawaban_benar ?? ''));
        $pilihan = is_array($soal->pilihan) ? $soal->pilihan : (json_decode((string) $soal->pilihan, true) ?? []);
        $index = array_search(strtoupper($kunci), ['A', 'B', 'C', 'D', 'E'], true);

        return $index !== false && isset($pilihan[$index]) ? (string) $pilihan[$index] : $kunci;
    }
}
