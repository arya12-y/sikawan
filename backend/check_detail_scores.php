<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$login = curl_init('http://localhost/api/login');
curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => 'budi.santoso@sikawan.test', 'password' => 'password'])]);
$loginResponse = json_decode(curl_exec($login), true);
curl_close($login);
$token = $loginResponse['token'] ?? null;

$detail = curl_init('http://localhost/api/pretest/detail');
curl_setopt_array($detail, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.$token]]);
$response = json_decode(curl_exec($detail), true);
$code = curl_getinfo($detail, CURLINFO_HTTP_CODE);
curl_close($detail);

echo 'HTTP: '.$code.PHP_EOL;
echo 'kompetensi_scores: '.json_encode($response['kompetensi_scores'] ?? null, JSON_UNESCAPED_UNICODE).PHP_EOL;
echo 'rata_rata: '.($response['rata_rata'] ?? 'missing').PHP_EOL;
