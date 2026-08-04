<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PesertaAsesmen;

$rejected = PesertaAsesmen::whereHas('user', fn ($q) => $q->where('email', 'agus.prasetyo@sikawan.test'))->latest()->firstOrFail();
$rejected->update(['status' => 'selesai', 'lulus' => false]);

foreach (['budi.santoso@sikawan.test', 'agus.prasetyo@sikawan.test', 'dewi.anggraeni@sikawan.test'] as $email) {
    $login = curl_init('http://localhost/api/login');
    curl_setopt_array($login, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['email' => $email, 'password' => 'password'])]);
    $loginBody = json_decode(curl_exec($login), true);
    curl_close($login);
    $status = curl_init('http://localhost/api/my-status');
    curl_setopt_array($status, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Accept: application/json', 'Authorization: Bearer '.($loginBody['token'] ?? '')]]);
    $body = json_decode(curl_exec($status), true);
    curl_close($status);
    echo $email.': '.json_encode($body['asesmen_lulus'] ?? null).' JSON_type='.get_debug_type($body['asesmen_lulus'] ?? null).' status='.($body['asesmen_status'] ?? '-').PHP_EOL;
}
