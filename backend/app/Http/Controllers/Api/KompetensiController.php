<?php

namespace App\Http\Controllers\Api;

use App\Models\Kompetensi;
use Illuminate\Database\Eloquent\Model;

class KompetensiController extends CrudController
{
    protected function modelClass(): string
    {
        return Kompetensi::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['kode' => ['required', 'string', 'max:50', $this->unique('kompetensis', 'kode', $model)], 'nama' => ['required', 'string', 'max:255'], 'deskripsi' => ['nullable', 'string'], 'domain' => ['nullable', 'string', 'max:255'], 'is_active' => ['boolean']];
    }
}
