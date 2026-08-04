<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Notifikasi;
use App\Models\User;

$base = 'http://localhost/api';
$request = function (string $method, string $url, ?string $token = null): array {
    $c = curl_init($url); $headers = ['Accept: application/json']; if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers]); $raw = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c); return [$code, json_decode($raw ?: '{}', true) ?: []];
};
$login = curl_init($base.'/login'); curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => 'agus.prasetyo@sikawan.test', 'password' => 'password'])]); $body = json_decode(curl_exec($login), true); curl_close($login);
$token = $body['token'] ?? null;
[$firstCode, $first] = $request('POST', $base.'/asesmen/minta-reset', $token);
[$secondCode, $second] = $request('POST', $base.'/asesmen/minta-reset', $token);
$adminIds = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['Super Admin', 'Admin Diskominfo'])->where('guard_name', 'sanctum'))->pluck('id');
$notifications = Notifikasi::whereIn('user_id', $adminIds)->where('judul', 'Permintaan Reset Asesmen')->count();
echo "first={$firstCode} message=".($first['message'] ?? '-')." second={$secondCode} cooldown=".json_encode($second['cooldown'] ?? null)." admin_notifications={$notifications}".PHP_EOL;
