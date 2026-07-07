<?php

namespace App\Http\Controllers\Api;

use App\Models\Badge;
use Illuminate\Database\Eloquent\Model;

class BadgeController extends CrudController
{
    protected function modelClass(): string
    {
        return Badge::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['nama' => ['required', 'string', 'max:255'], 'icon' => ['nullable', 'string'], 'deskripsi' => ['nullable', 'string'], 'nilai_min' => ['required', 'numeric', 'min:0'], 'is_active' => ['boolean']];
    }
}
