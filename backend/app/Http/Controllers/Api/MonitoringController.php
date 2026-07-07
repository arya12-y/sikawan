<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PesertaAsesmen;
use App\Models\User;
use Illuminate\Http\Request;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(PesertaAsesmen::with('user', 'asesmen')->latest()->paginate((int) $request->query('per_page', 15)));
    }

    public function user($id)
    {
        return response()->json(User::with('walidata', 'pesertaAsesmens.asesmen', 'sertifikats')->findOrFail($id));
    }
}
