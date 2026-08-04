<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
use App\Models\JawabanPeserta;
use App\Models\NilaiKompetensi;
use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;

// Hapus asesmen test "Uji Essay Flow"
$asesmens = Asesmen::where('judul', 'like', 'Uji Essay Flow%')->get();
foreach ($asesmens as $a) {
    // hapus data turunan
    $pesertaIds = PesertaAsesmen::where('asesmen_id', $a->id)->pluck('id');
    JawabanPeserta::whereIn('peserta_asesmen_id', $pesertaIds)->delete();
    Sertifikat::where('asesmen_id', $a->id)->delete();
    NilaiKompetensi::where('asesmen_id', $a->id)->delete();
    PesertaAsesmen::whereIn('id', $pesertaIds)->delete();
    $a->bankSoals()->detach();
    $a->forceDelete();
    echo 'Dihapus asesmen test: '.$a->judul.PHP_EOL;
}

// Cek sisa
echo PHP_EOL.'Sisa asesmen:'.PHP_EOL;
foreach (Asesmen::all() as $a) {
    echo $a->id.' | '.$a->judul.PHP_EOL;
}
