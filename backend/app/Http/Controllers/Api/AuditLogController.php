<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(AuditLog::with('user')->latest()->paginate((int) $request->query('per_page', 15)));
    }
}
