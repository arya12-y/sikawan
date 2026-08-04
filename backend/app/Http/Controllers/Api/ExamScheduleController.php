<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use App\Models\Wawancara;
use Illuminate\Http\Request;

class ExamScheduleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        return response()->json(ExamSchedule::latest()->paginate($perPage));
    }

    public function active()
    {
        $active = ExamSchedule::where('is_active', true)->first();
        if (!$active) {
            return response()->json(['message' => 'Tidak ada jadwal aktif'], 404);
        }
        return response()->json($active);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string'],
            'pretest_start' => ['required', 'date'],
            'pretest_end' => ['required', 'date', 'after:pretest_start'],
            'exam_start' => ['required', 'date'],
            'exam_end' => ['required', 'date', 'after:exam_start'],
            'kompetensi_ids' => ['nullable', 'array'],
            'kompetensi_ids.*' => ['exists:kompetensis,id'],
            'pretest_jumlah_per_kompetensi' => ['nullable', 'integer', 'min:1', 'max:20'],
            'status' => ['nullable', 'string', 'in:draft,published'],
        ]);

        if ($request->has('is_active') && $request->is_active) {
            ExamSchedule::where('is_active', true)->update(['is_active' => false]);
        }
        $data['is_active'] = $request->boolean('is_active') || $request->status === 'published';

        $schedule = ExamSchedule::create($data);

        return response()->json($schedule, 201);
    }

    public function update(Request $request, $id)
    {
        $schedule = ExamSchedule::findOrFail($id);

        $data = $request->validate([
            'title' => ['required', 'string'],
            'pretest_start' => ['required', 'date'],
            'pretest_end' => ['required', 'date', 'after:pretest_start'],
            'exam_start' => ['required', 'date'],
            'exam_end' => ['required', 'date', 'after:exam_start'],
            'kompetensi_ids' => ['nullable', 'array'],
            'kompetensi_ids.*' => ['exists:kompetensis,id'],
            'pretest_jumlah_per_kompetensi' => ['nullable', 'integer', 'min:1', 'max:20'],
            'status' => ['nullable', 'string', 'in:draft,published'],
        ]);

        if ($request->has('is_active') && $request->is_active && !$schedule->is_active) {
            ExamSchedule::where('is_active', true)->update(['is_active' => false]);
        }
        $data['is_active'] = $request->boolean('is_active') || $request->status === 'published';

        $schedule->update($data);

        return response()->json($schedule);
    }

    public function destroy($id)
    {
        $schedule = ExamSchedule::findOrFail($id);

        $affectedUserIds = collect();

        // Hapus PretestResult dalam range pretest
        if ($schedule->pretest_start && $schedule->pretest_end) {
            $pretestUsers = \App\Models\PretestResult::whereBetween('completed_at', [$schedule->pretest_start, $schedule->pretest_end])
                ->pluck('user_id');
            $affectedUserIds = $affectedUserIds->merge($pretestUsers);
            \App\Models\PretestResult::whereBetween('completed_at', [$schedule->pretest_start, $schedule->pretest_end])->delete();
        }

        // Hapus PesertaAsesmen dalam range exam
        if ($schedule->exam_start && $schedule->exam_end) {
            $asesmenUsers = \App\Models\PesertaAsesmen::whereBetween('created_at', [$schedule->exam_start, $schedule->exam_end])
                ->pluck('user_id');
            $affectedUserIds = $affectedUserIds->merge($asesmenUsers);
            \App\Models\PesertaAsesmen::whereBetween('created_at', [$schedule->exam_start, $schedule->exam_end])->delete();
        }

        $affectedUserIds = $affectedUserIds->unique();

        // Reset level & aktivasi buat user yang terdampak
        foreach ($affectedUserIds as $uid) {
            \App\Models\MateriProgress::where('user_id', $uid)->delete();
            \App\Models\Walidata::where('user_id', $uid)->update(['level_id' => null, 'pretest_activated' => false]);
        }

        $schedule->forceDelete();

        return response()->json([
            'message' => 'Jadwal berhasil dihapus. Data ' . $affectedUserIds->count() . ' user ikut di-reset.'
        ]);
    }

    public function stats(Request $request)
    {
        $scheduleId = $request->query('schedule_id');
        $schedule = $scheduleId ? ExamSchedule::find($scheduleId) : ExamSchedule::where('is_active', true)->first();

        if (!$schedule) {
            return response()->json([
                'total_walidata' => 0, 'pretest_selesai' => 0, 'sedang_asesmen' => 0,
                'asesmen_selesai' => 0, 'lulus' => 0, 'belum_pretest' => 0, 'active' => false,
            ]);
        }

        $walidataIds = \App\Models\User::role('Walidata')->pluck('id');
        $totalUsers = $walidataIds->count();

        $pretestSelesai = \App\Models\PretestResult::whereIn('user_id', $walidataIds)
            ->where('completed_at', '>=', $schedule->pretest_start)
            ->where('completed_at', '<=', $schedule->pretest_end)
            ->distinct('user_id')->count('user_id');

        $asesmenSelesai = \App\Models\PesertaAsesmen::whereIn('user_id', $walidataIds)
            ->whereIn('status', ['selesai', 'dinilai', 'menunggu_dinilai', 'wawancara'])
            ->where('created_at', '>=', $schedule->exam_start)
            ->where('created_at', '<=', $schedule->exam_end)
            ->distinct('user_id')->count('user_id');

        $lulus = \App\Models\PesertaAsesmen::whereIn('user_id', $walidataIds)
            ->where('lulus', true)
            ->where('created_at', '>=', $schedule->exam_start)
            ->where('created_at', '<=', $schedule->exam_end)
            ->distinct('user_id')->count('user_id');

        $sedangAsesmen = \App\Models\PesertaAsesmen::whereIn('user_id', $walidataIds)
            ->where('status', 'sedang_mengerjakan')
            ->where('created_at', '>=', $schedule->exam_start)
            ->where('created_at', '<=', $schedule->exam_end)
            ->distinct('user_id')->count('user_id');

        return response()->json([
            'total_walidata' => $totalUsers,
            'pretest_selesai' => $pretestSelesai,
            'sedang_asesmen' => $sedangAsesmen,
            'asesmen_selesai' => $asesmenSelesai,
            'lulus' => (bool) $lulus,
            'belum_pretest' => max(0, $totalUsers - $pretestSelesai),
            'active' => true,
            'schedule_title' => $schedule->title,
        ]);
    }

    public function myStatus(Request $request)
    {
        $user = $request->user()->load('walidata.level');
        $schedule = ExamSchedule::where('is_active', true)->first();
        $pretestDone = \App\Models\PretestResult::where('user_id', $user->id)->exists();

        if (!$schedule) {
            return response()->json(['phase' => 'none', 'pretest_done' => $pretestDone, 'level' => null, 'message' => 'Belum ada jadwal aktif']);
        }

        $lulus = \App\Models\PesertaAsesmen::where('user_id', $user->id)
            ->where('lulus', true)
            ->exists();

        $latestPeserta = \App\Models\PesertaAsesmen::where('user_id', $user->id)
            ->latest()
            ->first();

        $allPesertas = \App\Models\PesertaAsesmen::where('user_id', $user->id)
            ->whereIn('status', ['selesai', 'dinilai', 'menunggu_dinilai', 'wawancara'])
            ->count();
        $sedangCount = \App\Models\PesertaAsesmen::where('user_id', $user->id)
            ->where('status', 'sedang_mengerjakan')
            ->count();
        $belumCount = \App\Models\PesertaAsesmen::where('user_id', $user->id)
            ->where('status', 'belum_mulai')
            ->count();

        $totalAsesmen = \App\Models\Asesmen::whereIn('status', ['published', 'ongoing'])->count();
        $allDone = $totalAsesmen > 0 && $allPesertas >= $totalAsesmen && $sedangCount === 0 && $belumCount === 0;

        $nilaiKompetensi = \App\Models\NilaiKompetensi::with('kompetensi')
            ->where('user_id', $user->id)
            ->get()
            ->map(fn ($nk) => ['kompetensi_id' => $nk->kompetensi_id, 'kompetensi' => $nk->kompetensi?->nama ?? '-', 'nilai' => (int) $nk->nilai]);

        return response()->json([
            'schedule' => $schedule,
            'phase' => $schedule->current_phase,
            'pretest_done' => $pretestDone,
            'pretest_activated' => $user->walidata?->pretest_activated ?? false,
            'lulus' => $lulus,
            'asesmen_status' => $latestPeserta?->status,
            'asesmen_lulus' => $latestPeserta && !is_null($latestPeserta->lulus) ? (bool) $latestPeserta->lulus : null,
            'menunggu_dinilai' => $latestPeserta?->status === 'menunggu_dinilai',
            'wawancara_pending' => $latestPeserta?->status === 'wawancara' || Wawancara::whereHas('pesertaAsesmen', fn ($q) => $q->where('user_id', $user->id))->whereIn('status', ['terjadwal', 'berlangsung'])->exists(),
            'wawancara' => Wawancara::whereHas('pesertaAsesmen', fn ($q) => $q->where('user_id', $user->id))->latest()->first(),
            'asesmen_nilai' => $latestPeserta?->nilai,
            'asesmen_selesai' => $allPesertas,
            'asesmen_total' => $totalAsesmen,
            'all_asesmen_done' => $allDone,
            'nilai_kompetensi' => $nilaiKompetensi,
            'level_id' => $user->walidata?->level_id,
            'level_name' => $user->walidata?->level?->nama,
            'level_urutan' => $user->walidata?->level?->urutan,
            'reset_requested' => (bool) $user->walidata?->last_reset_request_at,
        ]);
    }
}
