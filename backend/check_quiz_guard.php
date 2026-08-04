<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\User;

$base = 'http://localhost/api';
$email = 'agus.prasetyo@sikawan.test';
$user = User::where('email', $email)->firstOrFail();
$materi = Materi::where('is_published', true)->whereHas('soals')->with('soals')->firstOrFail();
MateriProgress::where('user_id', $user->id)->where('materi_id', $materi->id)->delete();

function api(string $method, string $url, ?string $token = null, ?array $body = null): array
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

[$loginCode, $login] = api('POST', $base.'/login', null, ['email' => $email, 'password' => 'password']);
$token = $login['token'] ?? null;
[$quizCode] = api('GET', $base.'/materi/'.$materi->id.'/quiz', $token);
$answer = [['soal_id' => $materi->soals->first()->id, 'jawaban' => 'A']];
[$blockedCode, $blocked] = api('POST', $base.'/materi/'.$materi->id.'/quiz-submit', $token, ['jawaban' => $answer]);
[$progressCode] = api('POST', $base.'/materi/'.$materi->id.'/progress', $token, ['progress' => 50]);
[$allowedCode, $allowed] = api('POST', $base.'/materi/'.$materi->id.'/quiz-submit', $token, ['jawaban' => $answer]);

echo "login={$loginCode} quiz_get={$quizCode}\n";
echo "without_view: HTTP={$blockedCode} message=".($blocked['message'] ?? '-')."\n";
echo "view_progress: HTTP={$progressCode}\n";
echo "after_view: HTTP={$allowedCode} nilai=".($allowed['nilai'] ?? '-')."\n";
