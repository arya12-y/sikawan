<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$login = curl_init('http://localhost/api/login');
curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => 'budi.santoso@sikawan.test', 'password' => 'password'])]);
$loginResponse = json_decode(curl_exec($login), true);
curl_close($login);

$status = curl_init('http://localhost/api/my-status');
curl_setopt_array($status, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.($loginResponse['token'] ?? '')]]);
$response = json_decode(curl_exec($status), true);
$code = curl_getinfo($status, CURLINFO_HTTP_CODE);
curl_close($status);

echo 'HTTP: '.$code.PHP_EOL;
echo 'level_id: '.($response['level_id'] ?? 'missing').PHP_EOL;
echo 'level_name: '.($response['level_name'] ?? 'missing').PHP_EOL;
echo 'level_urutan: '.($response['level_urutan'] ?? 'missing').PHP_EOL;
