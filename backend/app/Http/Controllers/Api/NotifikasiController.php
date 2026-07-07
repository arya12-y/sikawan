<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Notifikasi::where('user_id', $request->user()->id)->latest()->paginate((int) $request->query('per_page', 15)));
    }

    public function store(Request $request)
    {
        abort_unless($this->isAdmin($request), 403);

        return response()->json(Notifikasi::create($request->validate(['user_id' => ['required', 'exists:users,id'], 'judul' => ['required'], 'pesan' => ['required'], 'tipe' => ['nullable'], 'link' => ['nullable']])), 201);
    }

    public function markRead(Request $request, $id)
    {
        $notifikasi = Notifikasi::findOrFail($id);
        abort_unless($notifikasi->user_id === $request->user()->id || $this->isAdmin($request), 403);
        $notifikasi->update(['is_read' => true, 'read_at' => now()]);

        return response()->json($notifikasi);
    }

    public function markAllRead(Request $request)
    {
        Notifikasi::where('user_id', $request->user()->id)->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Marked']);
    }

    private function isAdmin(Request $request): bool
    {
        return $request->user()?->hasAnyRole(['Super Admin', 'Admin Diskominfo']) || false;
    }
}
