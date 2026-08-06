<?php

namespace App\Http\Controllers\Api;

use App\Models\Penguji;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
