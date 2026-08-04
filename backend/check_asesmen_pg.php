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
[$c, $pt] = req('POST', '/pretest/start', $wtk, []);
if ($c === 200) {
    $ids = array_column($pt['soals'] ?? [], 'id');
    $ans = BankSoal::whereIn('id', $ids)->get(['id', 'jawaban_benar'])->map(fn ($s) => ['soal_id' => $s->id, 'jawaban' => $s->jawaban_benar])->values()->all();
    req('POST', '/pretest/submit', $wtk, ['sesi_id' => $pt['sesi_id'], 'jawaban' => $ans]);
}

// Asesmen Simulasi (pure PG, no essay)
[$c, $p] = req('POST', '/asesmens/1/start', $wtk, []);
echo 'start Simulasi: '.$c.' status='.($p['status'] ?? '-').PHP_EOL;
$pid = $p['id'] ?? null;
$soals = $p['asesmen']['bank_soals'] ?? [];
echo 'soal count: '.count($soals).PHP_EOL;

foreach ($soals as $s) {
    $soal = BankSoal::find($s['id']);
    if (!$soal || $soal->jenis !== 'pilihan_ganda') continue;
    $indeks = array_search($soal->jawaban_benar, ['A', 'B', 'C', 'D', 'E'], true);
    $pilihan = $soal->pilihan;
    $jawabanTeks = ($indeks !== false && isset($pilihan[$indeks])) ? $pilihan[$indeks] : $soal->jawaban_benar;
    [$c, $saved] = req('POST', '/peserta-asesmens/'.$pid.'/save-answer', $wtk, ['bank_soal_id' => $soal->id, 'jawaban' => $jawabanTeks]);
    echo '  #'.$soal->id.' benar='.var_export($saved['is_benar'] ?? null, true).PHP_EOL;
}

[$c, $sub] = req('POST', '/peserta-asesmens/'.$pid.'/submit', $wtk, []);
echo 'submit Simulasi: '.$c.' status='.($sub['status'] ?? '-').' nilai='.($sub['nilai'] ?? '-').PHP_EOL;
