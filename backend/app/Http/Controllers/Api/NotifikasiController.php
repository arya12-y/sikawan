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

        $data = $request->validate([
            'role' => ['required', 'string'],
            'judul' => ['required'],
            'pesan' => ['required'],
            'tipe' => ['nullable'],
            'link' => ['nullable']
        ]);

        $users = \App\Models\User::role($data['role'])->pluck('id');
        $notifications = [];
        
        foreach ($users as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'judul' => $data['judul'],
                'pesan' => $data['pesan'],
                'tipe' => $data['tipe'] ?? 'info',
                'link' => $data['link'] ?? null,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        Notifikasi::insert($notifications);

        return response()->json(['message' => 'Notifikasi berhasil dikirim ke ' . count($notifications) . ' pengguna'], 201);
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
