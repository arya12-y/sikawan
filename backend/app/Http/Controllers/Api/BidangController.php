<?php

namespace App\Http\Controllers\Api;

use App\Models\Bidang;
use Illuminate\Database\Eloquent\Model;

class BidangController extends CrudController
{
    protected array $with = ['opd'];

    protected array $searchable = ['nama', 'deskripsi'];

    protected array $filterable = ['opd_id', 'is_active'];

    protected array $sortable = ['id', 'nama', 'created_at', 'updated_at'];

    protected function modelClass(): string
    {
        return Bidang::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['opd_id' => ['required', 'exists:opds,id'], 'nama' => ['required', 'string', 'max:255'], 'deskripsi' => ['nullable', 'string'], 'is_active' => ['boolean']];
    }
}
