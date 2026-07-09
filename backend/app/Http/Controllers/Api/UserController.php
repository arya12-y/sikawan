<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends CrudController
{
    protected array $with = ['roles', 'walidata', 'penguji'];

    protected array $searchable = ['name', 'email', 'nip'];

    protected function modelClass(): string
    {
        return User::class;
    }

    protected function validationRules(?Model $model = null): array
    {
        return ['name' => [$model ? 'sometimes' : 'required', 'string', 'max:255'], 'email' => [$model ? 'sometimes' : 'required', 'email', Rule::unique('users')->ignore($model?->id)], 'password' => [$model ? 'nullable' : 'required', 'string', 'min:8'], 'nip' => ['nullable', 'string'], 'phone' => ['nullable', 'string'], 'address' => ['nullable', 'string'], 'photo' => ['nullable', 'string'], 'is_active' => ['sometimes', 'boolean'], 'roles' => ['array'], 'roles.*' => ['string']];
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), $this->validationRules())->validate();
        $roles = $data['roles'] ?? [];
        unset($data['roles']);
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        $user->syncRoles($roles);
        AuditLogService::log('create', 'User', null, null, $user->toArray());

        return response()->json($user->load($this->with), 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->hasAny(['is_active', 'roles']) && ! $request->user()?->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403, 'Anda tidak memiliki akses untuk mengubah status atau role pengguna');
        }

        $user = User::findOrFail($id);
        $old = $user->toArray();
        $data = Validator::make($request->all(), $this->validationRules($user))->validate();
        $roles = $data['roles'] ?? null;
        unset($data['roles']);
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        if (is_array($roles)) {
            $user->syncRoles($roles);
        }
        AuditLogService::log('update', 'User', null, $old, $user->fresh()->toArray());

        return response()->json($user->load($this->with));
    }
}
