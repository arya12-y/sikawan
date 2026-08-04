<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;
use App\Models\PesertaAsesmen;

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

// Reset + activate walidata dewi
[$c, $a] = req('POST', '/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$atk = $a['token'] ?? null;
[$c, $ud] = req('GET', '/users?per_page=200', $atk);
$dewi = null;
foreach (($ud['data'] ?? []) as $u) { if ($u['email'] === 'dewi.anggraeni@sikawan.test') { $dewi = $u; break; } }
if ($dewi) {
    $pests = PesertaAsesmen::where('user_id', $dewi['id'])->get();
    foreach ($pests as $p) req('POST', '/peserta-asesmens/'.$p->id.'/reset', $atk, []);
    req('POST', '/pretest/reset', $atk, ['user_id' => $dewi['id']]);
    req('POST', '/pretest/activate', $atk, ['user_id' => $dewi['id']]);
}

[$c, $w] = req('POST', '/login', null, ['email' => 'dewi.anggraeni@sikawan.test', 'password' => 'password']);
$wtk = $w['token'] ?? null;
echo 'login dewi: '.$c.PHP_EOL;

// pretest dulu (biar walidata bisa akses)
[$c, $pt] = req('POST', '/pretest/start', $wtk, []);
if ($c === 200) {
    $ids = array_column($pt['soals'] ?? [], 'id');
    $ans = BankSoal::whereIn('id', $ids)->get(['id', 'jawaban_benar'])->map(fn ($s) => ['soal_id' => $s->id, 'jawaban' => $s->jawaban_benar])->values()->all();
    req('POST', '/pretest/submit', $wtk, ['sesi_id' => $pt['sesi_id'], 'jawaban' => $ans]);
}

// list asesmen, ambil yang punya soal
[$c, $ases] = req('GET', '/asesmens?per_page=50', $wtk);
$list = $ases['data'] ?? [];
echo 'asesmen count: '.count($list).PHP_EOL;
$target = null;
foreach ($list as $a) {
    $bs = $a['bank_soals'] ?? $a['bankSoals'] ?? [];
    if (is_array($bs) && count($bs) > 0) { $target = $a; break; }
}
if (!$target) { echo 'no asesmen with soal'; exit; }
echo 'target asesmen: '.($target['judul'] ?? '?').PHP_EOL;

[$c, $peserta] = req('POST', '/asesmens/'.$target['id'].'/start', $wtk, []);
echo 'start: '.$c.' status='.($peserta['status'] ?? '-').PHP_EOL;
$pid = $peserta['id'] ?? null;
$soals = $peserta['asesmen']['bank_soals'] ?? [];
echo 'soal count: '.count($soals).PHP_EOL;

foreach ($soals as $s) {
    $soal = BankSoal::find($s['id']);
    if (!$soal || $soal->jenis !== 'pilihan_ganda') continue;
    // Kirim TEKS opsi yang benar (sama seperti frontend)
    $kunci = $soal->jawaban_benar;
    $pilihan = $soal->pilihan;
    $indeks = array_search($kunci, ['A', 'B', 'C', 'D', 'E'], true);
    $jawabanTeks = ($indeks !== false && isset($pilihan[$indeks])) ? $pilihan[$indeks] : $kunci;

    [$c, $saved] = req('POST', '/peserta-asesmens/'.$pid.'/save-answer', $wtk, ['bank_soal_id' => $soal->id, 'jawaban' => $jawabanTeks]);
    echo 'soal#'.$soal->id.' kunci='.$kunci.' kirim_teks='.substr($jawabanTeks, 0, 30).'... => save='.$c.' is_benar='.var_export($saved['is_benar'] ?? null, true).' nilai='.($saved['nilai'] ?? '-').PHP_EOL;
}

[$c, $sub] = req('POST', '/peserta-asesmens/'.$pid.'/submit', $wtk, []);
echo 'submit: '.$c.' status='.($sub['status'] ?? '-').' nilai='.($sub['nilai'] ?? '-').PHP_EOL;
