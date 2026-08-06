<?php

namespace App\Http\Controllers\Api;

use App\Models\Walidata;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), $this->validationRules())->validate();
        $model = $this->modelClass()::create($data);
        $this->syncNip($model);
        AuditLogService::log('create', class_basename($this->modelClass()), null, null, $model->toArray());

        return response()->json($model->load($this->with), 201);
    }

    public function update(Request $request, $id)
    {
        $model = $this->modelClass()::findOrFail($id);
        $old = $model->toArray();
        $data = Validator::make($request->all(), $this->validationRules($model))->validate();
        $model->update($data);
        $this->syncNip($model);
        AuditLogService::log('update', class_basename($this->modelClass()), null, $old, $model->fresh()->toArray());

        return response()->json($model->load($this->with));
    }

    private function syncNip($model): void
    {
        if ($model->user_id && $model->nip) {
            \App\Models\User::where('id', $model->user_id)->update(['nip' => $model->nip]);
        }
    }
}
