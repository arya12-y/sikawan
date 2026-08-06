<?php

namespace App\Http\Controllers\Api;

use App\Helpers\NotifikasiHelper;
use App\Http\Controllers\Controller;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\NilaiKompetensi;
use App\Models\Wawancara;
use App\Services\AssessmentService;
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
        $peserta->update(['status' => 'wawancara']);

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

    public function selesai(Request $request, AssessmentService $service, $id)
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

        $peserta = $wawancara->pesertaAsesmen()->with('asesmen')->firstOrFail();
        if ($data['rekomendasi'] === 'lulus') {
            $peserta->update(['status' => 'selesai', 'lulus' => true, 'approved_by' => $request->user()->id, 'approved_at' => now(), 'catatan_approve' => $data['catatan_wawancara'] ?? null]);
            Sertifikat::firstOrCreate(['user_id' => $peserta->user_id, 'asesmen_id' => $peserta->asesmen_id], ['nomor_sertifikat' => 'SKW-'.now()->format('Ymd').'-'.\Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(6)), 'kompetensi_id' => $peserta->asesmen?->kompetensi_id, 'level_id' => \App\Models\Walidata::where('user_id', $peserta->user_id)->value('level_id'), 'nilai_akhir' => $peserta->nilai, 'kategori_kompetensi' => $service->kategori((float) $peserta->nilai), 'tanggal_terbit' => now(), 'tanggal_expired' => now()->addYears(3), 'is_active' => true]);
            NotifikasiHelper::send($peserta->user_id, 'Lulus Asesmen', 'Selamat! Anda dinyatakan lulus pada asesmen "'.$peserta->asesmen?->judul.'". Sertifikat telah tersedia.', 'success', '/sertifikat');
        } else {
            Sertifikat::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id)->delete();
            $peserta->update(['status' => 'selesai', 'lulus' => false, 'approved_by' => $request->user()->id, 'approved_at' => now(), 'catatan_approve' => $data['catatan_wawancara'] ?? null]);
            $rendah = NilaiKompetensi::where('user_id', $peserta->user_id)->where('asesmen_id', $peserta->asesmen_id)->where('nilai', '<', 70)->orderBy('nilai')->first();
            NotifikasiHelper::send($peserta->user_id, 'Belum Lulus Asesmen', 'Anda belum lulus pada asesmen "'.$peserta->asesmen?->judul.'". Hubungi admin untuk reset asesmen.', 'warning', $rendah ? '/pembelajaran?kompetensi_id='.$rendah->kompetensi_id : '/pembelajaran');
        }

        $user = $wawancara->pesertaAsesmen?->user;
        if ($user) {
            $rekomendasiLabel = $data['rekomendasi'] === 'lulus' ? 'Lulus ✅' : 'Tidak Lulus ❌';
            $catatan = $data['catatan_wawancara'] ?? null;
            $pesan = "Wawancara asesmen telah selesai. Rekomendasi: {$rekomendasiLabel}.";
            if ($catatan) {
                $pesan .= " Catatan: {$catatan}.";
            }
            \App\Helpers\NotifikasiHelper::send($user->id, 'Hasil Wawancara', $pesan, 'info', '/penilaian');
        }

        return response()->json($wawancara->fresh()->load(['pesertaAsesmen.user', 'penguji']));
    }

    public function destroy($id)
    {
        abort_unless($this->canAccess(request()), 403);
        Wawancara::findOrFail($id)->forceDelete();
        return response()->json(['message' => 'Wawancara berhasil dihapus']);
    }
}
