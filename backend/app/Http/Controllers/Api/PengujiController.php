<?php

namespace App\Http\Controllers\Api;

use App\Models\Penguji;
use Illuminate\Database\Eloquent\Model;

class PengujiController extends CrudController
{
    protected array $with = ['user'];

    protected function modelClass(): string
    {
        return Penguji::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['user_id' => ['required', 'exists:users,id'], 'nip' => ['nullable', 'string'], 'bidang_keahlian' => ['nullable', 'string'], 'bio' => ['nullable', 'string'], 'is_active' => ['boolean']];
    }
}
