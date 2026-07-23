<?php

namespace App\Http\Controllers\Api;

use App\Helpers\NotifikasiHelper;
use App\Http\Controllers\Controller;
use App\Models\PesertaAsesmen;
use App\Models\Wawancara;
use Illuminate\Http\Request;

class WawancaraController extends Controller
{
    private function canAccess(Request $request): bool
    {
        $user = $request->user();
        return $user?->hasAnyRole(['Penguji', 'Super Admin', 'Admin Diskominfo']);
    }

    public function index(Request $request)
    {
        abort_unless($this->canAccess($request), 403);

        $query = Wawancara::with(['pesertaAsesmen.user', 'pesertaAsesmen.asesmen', 'penguji'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $q = $request->search;
            $query->whereHas('pesertaAsesmen.user', fn ($q2) => $q2->where('name', 'like', "%{$q}%"));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function jadwal(Request $request, $pesertaId)
    {
        abort_unless($this->canAccess($request), 403);

        $peserta = PesertaAsesmen::findOrFail($pesertaId);

        $data = $request->validate([
            'waktu_mulai' => ['required', 'date'],
            'durasi_menit' => ['required', 'integer', 'min:15', 'max:120'],
            'metode' => ['nullable', 'string', 'in:tatap_muka,online'],
            'catatan_jadwal' => ['nullable', 'string'],
        ]);

        $wawancara = Wawancara::create([
            'peserta_asesmen_id' => $peserta->id,
            'penguji_id' => $request->user()->id,
            'waktu_mulai' => $data['waktu_mulai'],
            'durasi_menit' => $data['durasi_menit'],
            'metode' => $data['metode'] ?? null,
            'catatan_jadwal' => $data['catatan_jadwal'] ?? null,
            'status' => 'terjadwal',
        ]);

        $tanggal = \Carbon\Carbon::parse($data['waktu_mulai'])->locale('id')->isoFormat('dddd, D MMMM Y HH:mm');
        NotifikasiHelper::send($peserta->user_id, 'Wawancara Dijadwalkan', "Wawancara untuk asesmen telah dijadwalkan pada {$tanggal}.", 'info', '/penilaian');

        return response()->json($wawancara->load(['pesertaAsesmen.user', 'penguji']), 201);
    }

    public function show($id)
    {
        $wawancara = Wawancara::with(['pesertaAsesmen.user', 'pesertaAsesmen.asesmen', 'penguji'])->findOrFail($id);

        $user = request()->user();
        if (!$user->hasAnyRole(['Penguji', 'Super Admin', 'Admin Diskominfo'])) {
            abort(403);
        }

        return response()->json($wawancara);
    }

    public function nilai(Request $request, $id)
    {
        abort_unless($this->canAccess($request), 403);

        $wawancara = Wawancara::findOrFail($id);

        $data = $request->validate([
            'nilai_pemahaman' => ['required', 'integer', 'min:1', 'max:5'],
            'nilai_komunikasi' => ['required', 'integer', 'min:1', 'max:5'],
            'nilai_penerapan' => ['required', 'integer', 'min:1', 'max:5'],
            'nilai_sikap' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $wawancara->update($data);

        return response()->json($wawancara);
    }

    public function selesai(Request $request, $id)
    {
        abort_unless($this->canAccess($request), 403);

        $wawancara = Wawancara::findOrFail($id);

        $data = $request->validate([
            'catatan_wawancara' => ['nullable', 'string'],
            'rekomendasi' => ['required', 'string', 'in:lulus,tidak_lulus'],
        ]);

        $wawancara->update([
            'catatan_wawancara' => $data['catatan_wawancara'] ?? null,
            'rekomendasi' => $data['rekomendasi'],
            'waktu_selesai' => now(),
            'status' => 'selesai',
        ]);

        return response()->json($wawancara->fresh()->load(['pesertaAsesmen.user', 'penguji']));
    }

    public function destroy($id)
    {
        abort_unless($this->canAccess(request()), 403);
        Wawancara::findOrFail($id)->delete();
        return response()->json(['message' => 'Wawancara berhasil dihapus']);
    }
}
