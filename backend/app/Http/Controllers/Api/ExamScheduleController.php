<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
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
        ExamSchedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Jadwal berhasil dihapus']);
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

        return response()->json([
            'schedule' => $schedule,
            'phase' => $schedule->current_phase,
            'pretest_done' => $pretestDone,
            'lulus' => $lulus,
            'asesmen_status' => $latestPeserta?->status,
            'asesmen_lulus' => $latestPeserta?->lulus,
            'asesmen_nilai' => $latestPeserta?->nilai,
            'level_id' => $user->walidata?->level_id,
            'level_name' => $user->walidata?->level?->nama,
        ]);
    }
}
