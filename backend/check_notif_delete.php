<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Notifikasi;
use App\Models\User;

$base = 'http://localhost/api';
$request = function (string $method, string $url, ?string $token = null, ?array $body = null): array {
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
    $raw = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
};

[$adminCode, $admin] = $request('POST', $base.'/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
[$sendCode] = $request('POST', $base.'/notifikasis', $admin['token'] ?? null, ['role' => 'Walidata', 'judul' => 'Delete Test', 'pesan' => 'Notifikasi sementara', 'tipe' => 'info', 'link' => null]);
[$walidataCode, $walidata] = $request('POST', $base.'/login', null, ['email' => 'walidata@sikawan.test', 'password' => 'password']);
[$listCode, $list] = $request('GET', $base.'/notifikasis?per_page=100', $walidata['token'] ?? null);
$item = collect($list['data'] ?? [])->firstWhere('judul', 'Delete Test');
$id = $item['id'] ?? null;
[$deleteCode] = $request('DELETE', $base.'/notifikasis/'.$id, $walidata['token'] ?? null);
[$afterCode, $after] = $request('GET', $base.'/notifikasis?per_page=100', $walidata['token'] ?? null);
$remaining = collect($after['data'] ?? [])->contains('id', $id);
echo "admin_login={$adminCode} send={$sendCode} walidata_login={$walidataCode} list={$listCode} delete={$deleteCode} after={$afterCode} id={$id} remaining=".($remaining ? 'yes' : 'no').PHP_EOL;
