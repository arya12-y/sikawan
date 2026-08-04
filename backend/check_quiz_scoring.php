<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\User;

$base = 'http://localhost/api';
$email = 'dewi.anggraeni@sikawan.test';
$user = User::where('email', $email)->firstOrFail();
$materiList = Materi::where('is_published', true)->whereHas('soals')->with('soals')->take(2)->get();

function apiRequest(string $method, string $url, ?string $token = null, ?array $body = null): array
{
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
    $raw = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
}

[$loginCode, $login] = apiRequest('POST', $base.'/login', null, ['email' => $email, 'password' => 'password']);
$token = $login['token'] ?? null;
foreach ($materiList as $index => $materi) {
    MateriProgress::where('user_id', $user->id)->where('materi_id', $materi->id)->delete();
    [$progressCode] = apiRequest('POST', $base.'/materi/'.$materi->id.'/progress', $token, ['progress' => 50]);
    [$quizCode, $quiz] = apiRequest('GET', $base.'/materi/'.$materi->id.'/quiz', $token);
    $answers = [];
    foreach ($materi->soals as $soal) {
        $key = strtoupper((string) $soal->jawaban_benar);
        $optionIndex = array_search($key, ['A', 'B', 'C', 'D', 'E'], true);
        $answers[] = ['soal_id' => $soal->id, 'jawaban' => $index === 0 ? ($soal->pilihan[$optionIndex] ?? $key) : $key];
    }
    [$submitCode, $result] = apiRequest('POST', $base.'/materi/'.$materi->id.'/quiz-submit', $token, ['jawaban' => $answers]);
    $passed = $submitCode === 200 && ($result['lulus'] ?? false) === true && ($result['nilai'] ?? 0) === 100 && ($result['materi_selesai'] ?? false) === true;
    echo ($passed ? 'PASS' : 'FAIL')." | ".($index === 0 ? 'text' : 'letter')." | materi={$materi->id} login={$loginCode} progress={$progressCode} quiz={$quizCode} submit={$submitCode} nilai=".($result['nilai'] ?? '-')." lulus=".var_export($result['lulus'] ?? null, true).PHP_EOL;
}
