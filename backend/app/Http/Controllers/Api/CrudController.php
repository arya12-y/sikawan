<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

abstract class CrudController extends Controller
{
    abstract protected function modelClass(): string;

    abstract protected function validationRules(?Model $model = null): array;

    protected array $with = [];

    protected array $searchable = [];

    protected array $filterable = [];

    protected array $sortable = ['id', 'created_at', 'updated_at'];

    public function index(Request $request)
    {
        $query = $this->modelClass()::query()->with($this->with);

        if ($search = $request->query('search')) {
            if ($this->searchable !== []) {
                $query->where(function ($q) use ($search) {
                    foreach ($this->searchable as $field) {
                        $q->orWhere($field, 'like', "%{$search}%");
                    }
                });
            }
        }

        foreach ($request->only($this->filterable) as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        $sort = in_array($request->query('sort'), $this->sortable, true) ? $request->query('sort') : 'id';
        $direction = $request->query('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        return response()->json($query->orderBy($sort, $direction)->paginate((int) $request->query('per_page', 15)));
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), $this->validationRules())->validate();
        $model = $this->modelClass()::create($data);
        AuditLogService::log('create', class_basename($this->modelClass()), null, null, $model->toArray());

        return response()->json($model->load($this->with), 201);
    }

    public function show($id)
    {
        return response()->json($this->modelClass()::with($this->with)->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $model = $this->modelClass()::findOrFail($id);
        $old = $model->toArray();
        $data = Validator::make($request->all(), $this->validationRules($model))->validate();
        $model->update($data);
        AuditLogService::log('update', class_basename($this->modelClass()), null, $old, $model->fresh()->toArray());

        return response()->json($model->load($this->with));
    }

    public function destroy($id)
    {
        $model = $this->modelClass()::findOrFail($id);
        $old = $model->toArray();
        $model->delete();
        AuditLogService::log('delete', class_basename($this->modelClass()), null, $old, null);

        return response()->json(['message' => 'Deleted']);
    }

    protected function unique(string $table, string $column, ?Model $model = null): Unique
    {
        return Rule::unique($table, $column)->ignore($model?->getKey());
    }
}
