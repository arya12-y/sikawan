<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\Level;
use App\Models\PretestResult;
use App\Models\Walidata;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PretestController extends Controller
{
    public function start(Request $request)
    {
        $user = $request->user();
        $schedule = \App\Models\ExamSchedule::where('is_active', true)->first();
        abort_unless($schedule && now()->between($schedule->pretest_start, $schedule->pretest_end), 403, 'Pretest belum dibuka');

        if (!$user->hasRole('Super Admin') && !$user->hasPermissionTo('asesmen.simulasi', 'sanctum')) {
            abort_unless($user->walidata?->pretest_activated, 403, 'Pretest belum diaktifkan oleh admin. Silakan hubungi admin.');
        }

        $existing = PretestResult::where('user_id', $user->id)->exists();
        if ($existing && !$user->hasRole('Super Admin') && !$user->hasPermissionTo('asesmen.simulasi', 'sanctum')) {
            abort(422, 'Anda sudah mengikuti pretest');
        }

        $kompetensiIds = $schedule->kompetensi_ids;
        $jumlah = $schedule->pretest_jumlah_per_kompetensi ?? 5;

        $soals = [];
        if ($kompetensiIds && count($kompetensiIds) > 0) {
            $allSoals = BankSoal::whereIn('kompetensi_id', $kompetensiIds)
                ->where('is_active', true)
                ->where('jenis', 'pilihan_ganda')
                ->whereJsonContains('tipe', 'pretest')
                ->get(['id', 'kompetensi_id', 'pertanyaan', 'pilihan', 'jenis', 'bobot'])
                ->groupBy('kompetensi_id');

            foreach ($kompetensiIds as $kid) {
                $pool = $allSoals->get($kid, collect());
                $soalList = $pool->count() > $jumlah ? $pool->random($jumlah) : $pool;
                $soals = array_merge($soals, $soalList->toArray());
            }
        } else {
            $soals = BankSoal::where('is_active', true)
                ->where('jenis', 'pilihan_ganda')
                ->whereJsonContains('tipe', 'pretest')
                ->inRandomOrder()
                ->limit($jumlah * 3)
                ->get(['id', 'kompetensi_id', 'pertanyaan', 'pilihan', 'jenis', 'bobot'])
                ->toArray();
        }

        shuffle($soals);

        $sesiId = Str::uuid()->toString();
        $durasi = $schedule->pretest_durasi ?? 30;
        $remainingMinutes = (int) ceil(now()->diffInMinutes($schedule->pretest_end, false));
        if ($remainingMinutes > 0) {
            $durasi = min($durasi, $remainingMinutes);
        }

        return response()->json([
            'sesi_id' => $sesiId,
            'soals' => $soals,
            'total' => count($soals),
            'durasi' => max($durasi, 1),
        ]);
    }

    public function submit(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'sesi_id' => ['required', 'string'],
            'jawaban' => ['required', 'array'],
            'jawaban.*.soal_id' => ['required', 'exists:bank_soals,id'],
            'jawaban.*.jawaban' => ['nullable', 'string'],
        ]);

        $isWalidata = $user->hasRole('Walidata');
        if (!$isWalidata) {
            abort_unless($user->hasPermissionTo('asesmen.simulasi', 'sanctum'), 403, 'Anda tidak memiliki izin pretest simulasi');
        }

        $jawabanList = $data['jawaban'];
        $soalIds = collect($jawabanList)->pluck('soal_id');
        $soals = BankSoal::whereIn('id', $soalIds)->get()->keyBy('id');

        $perKompetensi = [];

        foreach ($jawabanList as $item) {
            $soal = $soals->get($item['soal_id']);
            if (!$soal) continue;

            $jawabanUser = $item['jawaban'] ?? '';
            $benar = $this->isJawabanBenar($soal, $jawabanUser);
            $nilaiSoal = $benar ? (float) ($soal->bobot ?? 1) : 0;

            $kid = $soal->kompetensi_id;
            if (!isset($perKompetensi[$kid])) {
                $perKompetensi[$kid] = ['total' => 0, 'skor' => 0, 'jawaban' => []];
            }
            $perKompetensi[$kid]['total'] += (float) ($soal->bobot ?? 1);
            $perKompetensi[$kid]['skor'] += $nilaiSoal;
            $perKompetensi[$kid]['jawaban'][] = [
                'soal_id' => $item['soal_id'],
                'jawaban' => $jawabanUser,
                'benar' => $benar,
            ];
        }

        $totalNilai = 0;
        $totalKompetensi = count($perKompetensi);

        foreach ($perKompetensi as $kid => $result) {
            $nilai = $result['total'] > 0 ? round(($result['skor'] / $result['total']) * 100, 2) : 0;
            $totalNilai += $nilai;

            if ($isWalidata) {
                PretestResult::create([
                    'user_id' => $user->id,
                    'kompetensi_id' => $kid,
                    'sesi_id' => $data['sesi_id'],
                    'nilai' => $nilai,
                    'jawaban' => $result['jawaban'],
                    'completed_at' => now(),
                ]);
            }
        }

        $rataRata = $totalKompetensi > 0 ? round($totalNilai / $totalKompetensi) : 0;

        $level = Level::where('nilai_min', '<=', $rataRata)
            ->where('nilai_max', '>=', $rataRata)
            ->first() ?? Level::orderBy('id')->first();

        if ($isWalidata) {
            Walidata::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'level_id' => $level?->id,
                    'opd_id' => $user->walidata?->opd_id ?? optional(\App\Models\Opd::first())->id ?? 1,
                    'is_active' => true,
                ]
            );
        }

        $kompetensiIds = collect($perKompetensi)->keys();
        $kompetensiList = \App\Models\Kompetensi::whereIn('id', $kompetensiIds)->get()->keyBy('id');

        return response()->json([
            'sesi_id' => $data['sesi_id'],
            'rata_rata' => $rataRata,
            'level_name' => $level?->nama ?? 'Pemula',
            'level_id' => $level?->id,
            'kompetensi_scores' => collect($perKompetensi)->map(fn ($r, $k) => [
                'kompetensi' => $kompetensiList->get($k)?->nama ?? "Kompetensi #{$k}",
                'skor' => $r['total'] > 0 ? round(($r['skor'] / $r['total']) * 100, 2) : 0,
            ])->values(),
            ...(!$isWalidata ? ['simulasi' => true] : []),
        ]);
    }

    private function isJawabanBenar(BankSoal $soal, string $jawaban): bool
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

    public function result(Request $request)
    {
        $user = $request->user();
        $latestSesiId = PretestResult::where('user_id', $user->id)
            ->latest('completed_at')
            ->value('sesi_id');

        if (!$latestSesiId) {
            return response()->json(['message' => 'Belum ada hasil pretest'], 404);
        }

        $results = PretestResult::with('kompetensi')
            ->where('user_id', $user->id)
            ->where('sesi_id', $latestSesiId)
            ->get();

        if (!$results || $results->isEmpty()) {
            return response()->json(['message' => 'Belum ada hasil pretest'], 404);
        }

        $rataRata = round($results->avg('nilai'), 2);
        $first = $results->first();

        return response()->json([
            'sesi_id' => $first->sesi_id,
            'rata_rata' => $rataRata,
            'level_id' => $user->walidata?->level_id,
            'level_name' => $user->walidata?->level?->nama,
            'details' => $results->map(fn ($r) => [
                'kompetensi' => $r->kompetensi?->nama,
                'nilai' => $r->nilai,
            ]),
        ]);
    }

    public function detail(Request $request)
    {
        $user = $request->user();

        $latestSesiId = PretestResult::where('user_id', $user->id)
            ->latest('completed_at')
            ->value('sesi_id');

        if (!$latestSesiId) {
            return response()->json(['message' => 'Belum ada hasil pretest'], 404);
        }

        $results = PretestResult::with('kompetensi')
            ->where('user_id', $user->id)
            ->where('sesi_id', $latestSesiId)
            ->get();

        if (!$results || $results->isEmpty()) {
            return response()->json(['message' => 'Belum ada hasil pretest'], 404);
        }

        $sesiId = $results->first()->sesi_id;
        $allJawaban = $results->flatMap(fn ($r) => is_array($r->jawaban) ? $r->jawaban : []);
        $soalIds = collect($allJawaban)->pluck('soal_id');
        $soals = \App\Models\BankSoal::whereIn('id', $soalIds)->get()->keyBy('id');
        $rataRata = round($results->avg('nilai'), 2);

        $jawabanDetail = $allJawaban->map(fn ($j) => [
            'soal_id' => $j['soal_id'],
            'pertanyaan' => $soals->get($j['soal_id'])?->pertanyaan ?? '-',
            'pilihan' => $soals->get($j['soal_id'])?->pilihan,
            'jawaban_user' => $j['jawaban'] ?? '',
            'jawaban_benar' => $soals->get($j['soal_id'])?->jawaban_benar ?? '',
            'pembahasan' => $soals->get($j['soal_id'])?->pembahasan,
            'benar' => $j['benar'] ?? false,
        ]);

        return response()->json([
            'sesi_id' => $sesiId,
            'rata_rata' => $rataRata,
            'level_name' => $user->walidata?->level?->nama,
            'kompetensi_scores' => $results->map(fn ($r) => [
                'kompetensi' => $r->kompetensi?->nama ?? 'Kompetensi #'.$r->kompetensi_id,
                'skor' => (float) $r->nilai,
            ])->values(),
            'jawaban' => $jawabanDetail,
        ]);
    }

    public function monitoring(Request $request)
    {
        $search = $request->query('search');
        $perPage = (int) $request->query('per_page', 15);

        $query = PretestResult::whereHas('user', fn ($q) => $q->whereNull('deleted_at'))
            ->with(['user.walidata.level', 'kompetensi'])
            ->latest('completed_at');

        if ($search) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $results = $query->paginate($perPage);

        $grouped = collect($results->items())
            ->groupBy(fn ($r) => $r->user_id . '-' . $r->sesi_id)
            ->map(function ($group) {
                $first = $group->first();
                $avgNilai = round($group->avg('nilai'), 2);
                return [
                    'id' => $first->id,
                    'user_id' => $first->user_id,
                    'user_name' => $first->user?->name ?? '-',
                    'sesi_id' => $first->sesi_id,
                    'rata_rata' => $avgNilai,
                    'completed_at' => $first->completed_at,
                    'level_name' => $first->user?->walidata?->level?->nama ?? '-',
                ];
            })
            ->values();

        return response()->json([
            'data' => $grouped,
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'per_page' => $results->perPage(),
            'total' => $results->total(),
        ]);
    }

    public function activate(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403, 'Hanya admin yang dapat mengaktifkan pretest');
        }

        $validated = $request->validate(['user_id' => ['required', 'exists:users,id']]);
        $target = \App\Models\User::findOrFail($validated['user_id']);

        if ($walidata = $target->walidata) {
            $walidata->update(['pretest_activated' => true]);
        }

        return response()->json(['message' => 'Pretest diaktifkan untuk ' . $target->name]);
    }

    public function activateAll(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403);
        }

        $count = \App\Models\Walidata::where('pretest_activated', false)->update(['pretest_activated' => true]);

        return response()->json(['message' => "{$count} walidata berhasil diaktifkan"]);
    }

    public function deactivate(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403, 'Hanya admin yang dapat menonaktifkan pretest');
        }

        $validated = $request->validate(['user_id' => ['required', 'exists:users,id']]);
        $target = \App\Models\User::findOrFail($validated['user_id']);

        if ($walidata = $target->walidata) {
            $walidata->update(['pretest_activated' => false]);
        }

        return response()->json(['message' => 'Pretest dinonaktifkan untuk ' . $target->name]);
    }

    public function reset(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('Super Admin') && !$user->hasRole('Admin Diskominfo')) {
            abort(403, 'Hanya admin yang dapat mereset pretest');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $targetUser = \App\Models\User::findOrFail($validated['user_id']);

        PretestResult::where('user_id', $targetUser->id)->delete();
        \App\Models\MateriProgress::where('user_id', $targetUser->id)->delete();

        if ($walidata = $targetUser->walidata) {
            $walidata->update(['level_id' => null, 'pretest_activated' => false]);
        }

        return response()->json(['message' => 'Pretest berhasil direset']);
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403);
        }

        $walidatas = \App\Models\Walidata::with('user', 'opd')
            ->where('pretest_activated', false)
            ->get()
            ->map(fn ($w) => [
                'user_id' => $w->user_id,
                'user_name' => $w->user?->name ?? '-',
                'opd' => $w->opd?->singkatan ?? $w->opd?->nama ?? '-',
            ]);

        return response()->json($walidatas);
    }

    public function cleanup(Request $request)
    {
        $user = $request->user();
        if (!$user->hasRole('Super Admin') && !$user->hasRole('Admin Diskominfo')) {
            abort(403, 'Hanya admin yang dapat membersihkan data');
        }

        $deleted = PretestResult::whereDoesntHave('user')->delete();

        return response()->json(['message' => "Data sampah berhasil dibersihkan", 'deleted' => $deleted]);
    }
}
