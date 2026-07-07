<?php

namespace App\Http\Controllers\Api;

use App\Models\Materi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
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
        return ['kompetensi_id' => ['required', 'exists:kompetensis,id'], 'level_id' => ['nullable', 'exists:levels,id'], 'kategori_id' => ['nullable', 'exists:kategoris,id'], 'judul' => ['required', 'string'], 'deskripsi' => ['nullable', 'string'], 'jenis' => ['required', Rule::in(['video', 'pdf', 'presentasi', 'dokumen'])], 'file' => ['nullable', 'file', 'max:51200'], 'thumbnail_file' => ['nullable', 'image', 'max:4096'], 'file_path' => ['nullable', 'string'], 'thumbnail' => ['nullable', 'string'], 'url_video' => ['nullable', 'url'], 'durasi' => ['nullable', 'integer'], 'urutan' => ['nullable', 'integer'], 'is_published' => ['boolean']];
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), $this->validationRules())->validate();
        $data = $this->files($request, $data) + ['created_by' => $request->user()?->id] + $data;
        $materi = Materi::create($data);

        return response()->json($materi->load($this->with), 201);
    }

    public function update(Request $request, $id)
    {
        $materi = Materi::findOrFail($id);
        $data = Validator::make($request->all(), $this->validationRules($materi))->validate();
        $materi->update($this->files($request, $data) + $data);

        return response()->json($materi->load($this->with));
    }

    public function publish($id)
    {
        $materi = Materi::findOrFail($id);
        $materi->update(['is_published' => true, 'published_at' => now()]);

        return response()->json($materi);
    }

    private function files(Request $request, array $data): array
    {
        unset($data['file'], $data['thumbnail_file']);
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('materi', 'public');
        }
        if ($request->hasFile('thumbnail_file')) {
            $data['thumbnail'] = $request->file('thumbnail_file')->store('materi/thumbnails', 'public');
        }

        return $data;
    }
}
