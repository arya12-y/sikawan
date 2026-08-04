<?php

namespace App\Http\Controllers\Api;

use App\Models\Level;
use App\Models\Materi;
use App\Models\MateriProgress;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MateriController extends CrudController
{
    protected array $with = ['kompetensi', 'level', 'kategori', 'creator'];

    protected array $searchable = ['judul', 'deskripsi'];

    protected array $filterable = ['kompetensi_id', 'level_id', 'kategori_id', 'jenis', 'is_published', 'created_by'];

    protected array $sortable = ['id', 'judul', 'urutan', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return Materi::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['kompetensi_id' => ['required', 'exists:kompetensis,id'], 'level_id' => ['nullable', 'exists:levels,id'], 'kategori_id' => ['nullable', 'exists:kategoris,id'], 'judul' => ['required', 'string'], 'deskripsi' => ['nullable', 'string'], 'jenis' => ['required', Rule::in(['video', 'pdf', 'presentasi', 'dokumen'])], 'file' => ['nullable', 'file', 'max:51200'], 'thumbnail_file' => ['nullable', 'image', 'max:4096'], 'file_path' => ['nullable', 'string'], 'thumbnail' => ['nullable', 'string'], 'url_video' => ['nullable', 'url'], 'durasi' => ['nullable', 'integer'], 'urutan' => ['nullable', 'integer'], 'is_published' => ['boolean'], 'remove_thumbnail' => ['nullable', 'string'], 'remove_file' => ['nullable', 'string']];
    }

    public function index(Request $request)
    {
        $query = $this->modelClass()::query()->with($this->with)->withCount('soals');

        if ($request->user()?->hasRole('Walidata')) {
            $query->with(['progress' => function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            }]);
        }

        // Non-admin users only see published materials
        if (!$request->user()?->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            $query->where('is_published', true);
        }

        if ($search = $request->query('search')) {
            if ($this->searchable !== []) {
                $query->where(function ($q) use ($search) {
                    foreach ($this->searchable as $field) {
                        $q->orWhere($field, 'like', "%{$search}%");
                    }
                });
            }
        }

        foreach ($request->only($this->filterable) as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        $sort = in_array($request->query('sort'), $this->sortable, true) ? $request->query('sort') : 'id';
        $direction = $request->query('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        return response()->json($query->orderBy($sort, $direction)->paginate((int) $request->query('per_page', 15)));
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), $this->validationRules())->validate();
        $hasFile = $request->hasFile('file');
        $files = $this->files($request);
        $data = array_merge($data, $files, ['created_by' => $request->user()?->id]);
        $soalIds = json_decode($request->input('soal_ids', '[]'), true) ?? [];
        $this->validateQuizSoals($request, $soalIds);
        $materi = Materi::create($data);
        $allSoalIds = $this->syncMateriSoals($materi, $soalIds, $request);

        return response()->json([
            'materi' => $materi->load(array_merge($this->with, ['soals'])),
            'file_uploaded' => $hasFile,
            'file_path' => $materi->file_path,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);
        $hasFile = $request->hasFile('file');
        $data = Validator::make($request->all(), $this->validationRules($materi))->validate();
        $files = $this->files($request);
        $soalIds = json_decode($request->input('soal_ids', '[]'), true) ?? [];
        $this->validateQuizSoals($request, $soalIds, $materi);
        if (!empty($data['remove_thumbnail'])) {
            $files['thumbnail'] = null;
        }
        if (!empty($data['remove_file'])) {
            $files['file_path'] = null;
        }
        $materi->update(array_merge($data, $files));
        $this->syncMateriSoals($materi, $soalIds, $request);

        return response()->json([
            'materi' => $materi->load(array_merge($this->with, ['soals'])),
            'file_uploaded' => $hasFile,
            'file_path' => $materi->fresh()->file_path,
        ]);
    }

    public function destroy($id)
    {
        $materi = Materi::withTrashed()->findOrFail($id);
        $materi->soals()->detach();
        $materi->forceDelete();
        \App\Services\AuditLogService::log('delete', 'Materi', null, null, ['id' => $id]);

        return response()->json(['message' => 'Materi dihapus permanen']);
    }

    public function trackProgress(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('Walidata')) {
            return response()->json(['progress' => ['progress' => 0, 'is_completed' => false], 'level_up' => null]);
        }

        $data = $request->validate(['progress' => ['required', 'integer', 'min:0', 'max:100']]);

        $progress = MateriProgress::updateOrCreate(
            ['user_id' => $user->id, 'materi_id' => $materi->id],
            [
                'progress' => $data['progress'],
                'is_completed' => $data['progress'] >= 100,
                'completed_at' => $data['progress'] >= 100 ? now() : null,
            ]
        );

        $levelUp = null;
        if ($data['progress'] >= 100 && $walidata = $user->walidata) {
            $currentLevel = $walidata->level;
            if ($currentLevel) {
                $totalAtLevel = Materi::where('level_id', $currentLevel->id)
                    ->where('is_published', true)
                    ->count();

                $completedAtLevel = MateriProgress::where('user_id', $user->id)
                    ->where('is_completed', true)
                    ->whereIn('materi_id', Materi::where('level_id', $currentLevel->id)->pluck('id'))
                    ->count();

                if ($totalAtLevel > 0 && $completedAtLevel >= $totalAtLevel) {
                    $nextLevel = Level::where('urutan', $currentLevel->urutan + 1)->first();
                    if ($nextLevel) {
                        $walidata->update(['level_id' => $nextLevel->id]);
                        $levelUp = [
                            'old_level' => $currentLevel->nama,
                            'new_level' => $nextLevel->nama,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'progress' => $progress,
            'level_up' => $levelUp,
        ]);
    }

    public function quiz($id)
    {
        $materi = Materi::with('soals')->findOrFail($id);
        $soals = $materi->soals->where('is_active', true)->values();

        return response()->json([
            'materi_id' => $materi->id,
            'judul' => $materi->judul,
            'soals' => $soals,
            'total' => $soals->count(),
        ]);
    }

    public function submitQuiz(Request $request, $id)
    {
        $materi = Materi::with('soals')->findOrFail($id);
        $user = $request->user();

        if ($user->hasRole('Walidata') && !MateriProgress::where('user_id', $user->id)
            ->where('materi_id', $materi->id)
            ->where('progress', '>', 0)
            ->exists()) {
            abort(422, 'Tonton materi terlebih dahulu sebelum mengerjakan quiz.');
        }

        $data = $request->validate([
            'jawaban' => ['required', 'array'],
            'jawaban.*.soal_id' => ['required', 'exists:bank_soals,id'],
            'jawaban.*.jawaban' => ['nullable', 'string'],
        ]);

        $soals = $materi->soals->keyBy('id');
        $benar = 0;
        $total = count($data['jawaban']);

        foreach ($data['jawaban'] as $item) {
            $soal = $soals->get($item['soal_id']);
            if (!$soal) continue;
            if ($this->isJawabanQuizBenar($soal, $item['jawaban'] ?? '')) {
                $benar++;
            }
        }

        $nilai = $total > 0 ? round(($benar / $total) * 100) : 0;
        $lulus = $nilai >= 70;

        if ($user->hasRole('Walidata')) {
            $progressData = $lulus
                ? ['progress' => 100, 'is_completed' => true, 'completed_at' => now()]
                : ['progress' => 100, 'is_completed' => false, 'completed_at' => null];

            MateriProgress::updateOrCreate(
                ['user_id' => $user->id, 'materi_id' => $materi->id],
                $progressData
            );
        }

        $levelUp = null;
        if ($lulus && $user->hasRole('Walidata') && $walidata = $user->walidata) {
            $currentLevel = $walidata->level;
            if ($currentLevel) {
                $totalAtLevel = Materi::where('level_id', $currentLevel->id)
                    ->where('is_published', true)->count();
                $completedAtLevel = MateriProgress::where('user_id', $user->id)
                    ->where('is_completed', true)
                    ->whereIn('materi_id', Materi::where('level_id', $currentLevel->id)->pluck('id'))
                    ->count();
                if ($totalAtLevel > 0 && $completedAtLevel >= $totalAtLevel) {
                    $nextLevel = Level::where('urutan', $currentLevel->urutan + 1)->first();
                    if ($nextLevel) {
                        $walidata->update(['level_id' => $nextLevel->id]);
                        $levelUp = ['old_level' => $currentLevel->nama, 'new_level' => $nextLevel->nama];
                    }
                }
            }
        }

        return response()->json([
            'benar' => $benar,
            'total' => $total,
            'nilai' => $nilai,
            'lulus' => $lulus,
            'materi_selesai' => $lulus,
            'level_up' => $levelUp,
        ]);
    }

    private function isJawabanQuizBenar(\App\Models\BankSoal $soal, string $jawaban): bool
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

    public function show($id)
    {
        return response()->json(Materi::with(array_merge($this->with, ['soals']))->findOrFail($id));
    }

    public function serveFile($id)
    {
        $materi = Materi::findOrFail($id);
        if (!$materi->file_path || !Storage::disk('public')->exists($materi->file_path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return response()->file(Storage::disk('public')->path($materi->file_path));
    }

    public function downloadFile($id)
    {
        $materi = Materi::findOrFail($id);
        if (!$materi->file_path || !Storage::disk('public')->exists($materi->file_path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        $extension = pathinfo($materi->file_path, PATHINFO_EXTENSION);
        $filename = str($materi->judul)->slug()->append($extension ? '.' . $extension : '')->value();

        return Storage::disk('public')->download($materi->file_path, $filename);
    }

    public function serveThumbnail($id)
    {
        $materi = Materi::findOrFail($id);
        if (!$materi->thumbnail) {
            return response()->json(['error' => 'Thumbnail tidak ditemukan di database'], 404);
        }
        $path = Storage::disk('public')->path($materi->thumbnail);
        if (!file_exists($path)) {
            return response()->json(['error' => 'Thumbnail fisik tidak ditemukan di server'], 404);
        }

        return response()->file($path);
    }

    private function files(Request $request): array
    {
        $result = [];
        if ($request->hasFile('file')) {
            $result['file_path'] = $request->file('file')->store('materi', 'public');
        }
        if ($request->hasFile('thumbnail_file')) {
            $result['thumbnail'] = $request->file('thumbnail_file')->store('materi/thumbnails', 'public');
        }
        return $result;
    }

    private function syncMateriSoals(Materi $materi, array $soalIds, Request $request): array
    {
        $manualSoals = $request->input('manual_soals');
        if ($manualSoals) {
            $lines = explode("\n", trim($manualSoals));
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;
                $parts = array_map('trim', explode('|', $line));
                if (count($parts) < 2) continue;

                $pertanyaan = $parts[0];
                $jawabanBenar = $parts[1];
                $pilihan = count($parts) > 2 ? array_slice($parts, 2) : null;

                $soal = \App\Models\BankSoal::create([
                    'kompetensi_id' => $materi->kompetensi_id,
                    'level_id' => $materi->level_id,
                    'jenis' => $pilihan ? 'pilihan_ganda' : 'essay',
                    'tipe' => ['quiz'],
                    'pertanyaan' => $pertanyaan,
                    'pilihan' => $pilihan,
                    'jawaban_benar' => $jawabanBenar,
                    'is_active' => true,
                    'created_by' => $request->user()?->id,
                ]);
                $soalIds[] = $soal->id;
            }
        }

        if ($soalIds) $materi->soals()->sync($soalIds);
        return $soalIds;
    }

    private function validateQuizSoals(Request $request, array $soalIds, ?Materi $materi = null): void
    {
        $manualSoals = trim((string) $request->input('manual_soals', ''));
        $manualCount = collect($manualSoals === '' ? [] : explode("\n", $manualSoals))
            ->filter(fn ($line) => count(array_map('trim', explode('|', trim($line)))) >= 2)
            ->count();
        $existingCount = $materi?->soals()->whereJsonContains('tipe', 'quiz')->count() ?? 0;

        abort_if(count($soalIds) + $manualCount + $existingCount === 0, 422, 'Setiap materi wajib memiliki minimal 1 soal quiz.');
    }

}
