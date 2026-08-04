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
        $walidataIds = \App\Models\Walidata::pluck('user_id');
        $query = PesertaAsesmen::whereIn('user_id', $walidataIds)->with('user', 'asesmen')->latest();

        if ($search = $request->query('search')) {
            $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 15)));
    }

    public function user($id)
    {
        return response()->json(User::with('walidata', 'pesertaAsesmens.asesmen', 'sertifikats')->findOrFail($id));
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Admin Diskominfo'])) {
            abort(403);
        }

        $peserta = PesertaAsesmen::findOrFail($id);
        $peserta->jawabanPesertas()->delete();

        \App\Models\Sertifikat::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id)->delete();
        \App\Models\Wawancara::where('peserta_asesmen_id', $peserta->id)->delete();
        \App\Models\NilaiKompetensi::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id)->delete();
        $peserta->forceDelete();

        return response()->json(['message' => 'Data monitoring berhasil dihapus']);
    }
}
