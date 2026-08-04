<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\BankSoal;
use App\Models\PretestResult;
use App\Models\User;

$base = 'http://localhost/api';
$users = ['dewi.anggraeni@sikawan.test' => 'text', 'ririn.safitri@sikawan.test' => 'letter'];

function requestApi(string $method, string $url, ?string $token = null, ?array $body = null): array
{
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body ? json_encode($body) : null]);
    $raw = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
}

foreach ($users as $email => $format) {
    $user = User::where('email', $email)->firstOrFail();
    PretestResult::where('user_id', $user->id)->delete();
    $user->walidata()->update(['pretest_activated' => true]);

    [$code, $login] = requestApi('POST', $base.'/login', null, ['email' => $email, 'password' => 'password']);
    $token = $login['token'] ?? null;
    [$startCode, $start] = requestApi('POST', $base.'/pretest/start', $token);
    $answers = [];
    foreach ($start['soals'] ?? [] as $item) {
        $soal = BankSoal::findOrFail($item['id']);
        $key = strtoupper((string) $soal->jawaban_benar);
        $index = array_search($key, ['A', 'B', 'C', 'D', 'E'], true);
        $answers[] = ['soal_id' => $soal->id, 'jawaban' => $format === 'text' ? $soal->pilihan[$index] : $key];
    }
    [$submitCode, $result] = requestApi('POST', $base.'/pretest/submit', $token, ['sesi_id' => $start['sesi_id'] ?? '', 'jawaban' => $answers]);
    $scores = $result['kompetensi_scores'] ?? [];
    $passed = $submitCode === 200 && ($result['rata_rata'] ?? 0) > 0 && count($scores) > 0 && collect($scores)->every(fn ($score) => $score['skor'] > 0);
    echo ($passed ? 'PASS' : 'FAIL')." | {$email} ({$format}) | login={$code} start={$startCode} submit={$submitCode} rata_rata=".($result['rata_rata'] ?? '-')." kompetensi_scores=".json_encode($scores).PHP_EOL;
}
