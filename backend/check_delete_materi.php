<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;

$BASE = 'http://localhost/api';

function req($method, $path, $token = null, $body = null) {
    global $BASE;
    $ch = curl_init($BASE.$path);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 30,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($raw, true)];
}

[$c, $a] = req('POST', '/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$atk = $a['token'] ?? null;
echo 'admin login: '.$c.PHP_EOL;
if (!$atk) exit;

// Buat materi test unik (wajib punya soal quiz)
$judul = 'Materi Delete Test '.date('His');
$soal = \App\Models\BankSoal::where('jenis', 'pilihan_ganda')->whereJsonContains('tipe', 'quiz')->first();
[$c, $created] = req('POST', '/materis', $atk, [
    'kompetensi_id' => 1, 'level_id' => 1, 'kategori_id' => 1,
    'judul' => $judul, 'deskripsi' => 'test', 'jenis' => 'pdf', 'is_published' => false,
    'soal_ids' => $soal ? [$soal->id] : [],
]);
echo 'create: '.$c.' response='.json_encode($created).PHP_EOL;
$mid = $created['materi']['id'] ?? $created['id'] ?? null;

if ($mid) {
    // DELETE
    [$c, $del] = req('DELETE', '/materis/'.$mid, $atk);
    echo 'delete: '.$c.' response='.json_encode($del).PHP_EOL;

    // Cek via API index (search judul unik)
    [$c, $idx] = req('GET', '/materis?search='.urlencode($judul), $atk);
    $found = count($idx['data'] ?? []);
    echo 'index search after delete: '.$c.' found='.$found.PHP_EOL;

    // Cek DB langsung (dengan dan tanpa trashed)
    $withTrashed = Materi::withTrashed()->find($mid);
    echo 'DB withTrashed: '.($withTrashed ? 'ADA (deleted_at='.($withTrashed->deleted_at ?? 'null').')' : 'TIDAK ADA').PHP_EOL;
    $normal = Materi::find($mid);
    echo 'DB normal: '.($normal ? 'ADA' : 'TIDAK ADA').PHP_EOL;
}
