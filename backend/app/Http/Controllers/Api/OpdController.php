<?php

namespace App\Http\Controllers\Api;

use App\Models\Opd;
use Illuminate\Database\Eloquent\Model;

class OpdController extends CrudController
{
    protected array $searchable = ['kode', 'nama', 'singkatan', 'email'];

    protected array $filterable = ['is_active'];

    protected array $sortable = ['id', 'kode', 'nama', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return Opd::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['kode' => ['required', 'string', 'max:50', $this->unique('opds', 'kode', $model)], 'nama' => ['required', 'string', 'max:255'], 'singkatan' => ['nullable', 'string', 'max:100'], 'alamat' => ['nullable', 'string'], 'telepon' => ['nullable', 'string', 'max:50'], 'email' => ['nullable', 'email'], 'website' => ['nullable', 'url'], 'logo' => ['nullable', 'string'], 'is_active' => ['boolean']];
    }
}
