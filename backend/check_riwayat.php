<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$login = curl_init('http://localhost/api/login');
curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => 'penguji@sikawan.test', 'password' => 'password'])]);
$body = json_decode(curl_exec($login), true); curl_close($login);
$request = curl_init('http://localhost/api/penilaian/riwayat?per_page=50');
curl_setopt_array($request, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.($body['token'] ?? '')]]);
$response = json_decode(curl_exec($request), true); $code = curl_getinfo($request, CURLINFO_HTTP_CODE); curl_close($request);
echo 'HTTP: '.$code.PHP_EOL.'count: '.count($response['data'] ?? []).PHP_EOL.'sample: '.json_encode($response['data'][0] ?? null, JSON_UNESCAPED_UNICODE).PHP_EOL;
