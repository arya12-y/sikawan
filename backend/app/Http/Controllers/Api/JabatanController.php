<?php

namespace App\Http\Controllers\Api;

use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Model;

class JabatanController extends CrudController
{
    protected array $searchable = ['nama', 'deskripsi'];

    protected array $filterable = ['level', 'is_active'];

    protected array $sortable = ['id', 'nama', 'level', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return Jabatan::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['nama' => ['required', 'string', 'max:255'], 'deskripsi' => ['nullable', 'string'], 'level' => ['nullable', 'integer', 'min:0'], 'is_active' => ['boolean']];
    }
}
