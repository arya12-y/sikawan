<?php

namespace App\Http\Controllers\Api;

use App\Models\Level;
use Illuminate\Database\Eloquent\Model;

class LevelController extends CrudController
{
    protected function modelClass(): string
    {
        return Level::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['nama' => ['required', 'string', 'max:255'], 'kode' => ['required', 'string', 'max:50', $this->unique('levels', 'kode', $model)], 'urutan' => ['required', 'integer'], 'nilai_min' => ['required', 'numeric'], 'nilai_max' => ['required', 'numeric', 'gte:nilai_min'], 'warna' => ['nullable', 'string', 'max:50'], 'deskripsi' => ['nullable', 'string'], 'is_active' => ['boolean']];
    }
}
