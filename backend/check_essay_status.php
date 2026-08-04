<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$login = curl_init('http://localhost/api/login');
curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => 'penguji@sikawan.test', 'password' => 'password'])]);
$loginBody = json_decode(curl_exec($login), true);
curl_close($login);

$request = curl_init('http://localhost/api/penilaian/essay?per_page=5');
curl_setopt_array($request, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.($loginBody['token'] ?? '')]]);
$body = json_decode(curl_exec($request), true);
$code = curl_getinfo($request, CURLINFO_HTTP_CODE);
curl_close($request);

$item = collect($body['data'] ?? [])->firstWhere('wawancara_pending', true);
echo 'HTTP: '.$code.PHP_EOL;
echo 'status: '.($item['status'] ?? 'missing').PHP_EOL;
echo 'wawancara_pending: '.json_encode($item['wawancara_pending'] ?? null).PHP_EOL;
