<?php

namespace App\Http\Controllers\Api;

use App\Models\Walidata;
use Illuminate\Database\Eloquent\Model;

class WalidataController extends CrudController
{
    protected array $with = ['user', 'opd', 'bidang', 'jabatan', 'level'];

    protected function modelClass(): string
    {
        return Walidata::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['user_id' => ['required', 'exists:users,id'], 'opd_id' => ['required', 'exists:opds,id'], 'bidang_id' => ['nullable', 'exists:bidangs,id'], 'jabatan_id' => ['nullable', 'exists:jabatans,id'], 'level_id' => ['nullable', 'exists:levels,id'], 'nip' => ['nullable', 'string'], 'nilai_kompetensi' => ['nullable', 'numeric'], 'is_active' => ['boolean']];
    }
}
