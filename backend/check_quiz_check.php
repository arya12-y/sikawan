<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\BankSoal;

$base = 'http://localhost/api';
$request = function (string $method, string $url, ?string $token = null, ?array $body = null): array {
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
    $raw = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
};
[$loginCode, $login] = $request('POST', $base.'/login', null, ['email' => 'walidata@sikawan.test', 'password' => 'password']);
$token = $login['token'] ?? null;
[$startCode, $start] = $request('GET', $base.'/quiz/start?jumlah=3', $token);
$soalData = collect($start['soals'] ?? [])->first(fn ($soal) => $soal['jenis'] === 'pilihan_ganda');
$soal = BankSoal::findOrFail($soalData['id']);
$index = array_search(strtoupper((string) $soal->jawaban_benar), ['A', 'B', 'C', 'D', 'E'], true);
$text = $soal->pilihan[$index];
foreach ([['text', $text], ['letter', $soal->jawaban_benar]] as [$label, $answer]) {
    [$code, $result] = $request('POST', $base.'/quiz/check', $token, ['soal_id' => $soal->id, 'jawaban' => $answer]);
    $passed = $code === 200 && ($result['benar'] ?? false) === true && $result['jawaban_benar'] === $text;
    echo ($passed ? 'PASS' : 'FAIL')." | {$label} | HTTP={$code} benar=".var_export($result['benar'] ?? null, true)." resolved=".($result['jawaban_benar'] ?? '-').PHP_EOL;
}
