<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all()->pluck('name');
        $grouped = [];

        foreach ($permissions as $name) {
            $parts = explode('.', $name, 2);
            $module = $parts[0] ?? 'general';
            $action = $parts[1] ?? $name;
            $grouped[$module][] = ['name' => $name, 'action' => $action];
        }

        return response()->json($grouped);
    }
}
