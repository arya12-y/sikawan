<?php

namespace App\Http\Controllers\Api;

use App\Models\Kategori;
use Illuminate\Database\Eloquent\Model;

class KategoriController extends CrudController
{
    protected function modelClass(): string
    {
        return Kategori::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['nama' => ['required', 'string', 'max:255'], 'slug' => ['required', 'string', 'max:255', $this->unique('kategoris', 'slug', $model)], 'deskripsi' => ['nullable', 'string'], 'is_active' => ['boolean']];
    }
}
