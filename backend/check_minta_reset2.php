<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$BASE = 'http://localhost/api';

function req($method, $path, $token = null, $body = null) {
    global $BASE;
    $ch = curl_init($BASE.$path);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 30,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($raw, true)];
}

// Reset cooldown walidata agus agar bisa test 200
$agus = User::where('email', 'agus.prasetyo@sikawan.test')->first();
if ($agus?->walidata) {
    $agus->walidata->update(['last_reset_request_at' => null]);
    echo 'Cooldown agus di-reset'.PHP_EOL;
}

[$c, $w] = req('POST', '/login', null, ['email' => 'agus.prasetyo@sikawan.test', 'password' => 'password']);
$tk = $w['token'] ?? null;
echo 'login: '.$c.PHP_EOL;

[$c, $r1] = req('POST', '/asesmen/minta-reset', $tk);
echo '1st request: '.$c.' msg='.($r1['message'] ?? '-').PHP_EOL;

[$c, $r2] = req('POST', '/asesmen/minta-reset', $tk);
echo '2nd request: '.$c.' cooldown='.var_export($r2['cooldown'] ?? null, true).' msg='.($r2['message'] ?? '-').PHP_EOL;
