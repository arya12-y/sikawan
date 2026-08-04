<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\BankSoal;
use App\Models\Kategori;
use App\Models\Level;
use App\Models\Materi;
use App\Models\User;

$base = 'http://localhost/api';
$request = function (string $method, string $url, ?string $token = null, ?array $body = null): array {
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
    $raw = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
};

[$loginCode, $login] = $request('POST', $base.'/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$soal = BankSoal::where('is_active', true)->firstOrFail();
[$createCode, $created] = $request('POST', $base.'/materis', $login['token'] ?? null, [
    'kompetensi_id' => $soal->kompetensi_id,
    'level_id' => $soal->level_id,
    'kategori_id' => Kategori::first()->id,
    'judul' => 'Materi Permanent Delete Test '.uniqid(),
    'jenis' => 'pdf',
    'is_published' => false,
    'soal_ids' => json_encode([$soal->id]),
]);
$id = $created['materi']['id'] ?? $created['id'] ?? null;
[$deleteCode] = $request('DELETE', $base.'/materis/'.$id, $login['token'] ?? null);
echo "login={$loginCode} create={$createCode} delete={$deleteCode} id={$id} remaining=".(Materi::withTrashed()->find($id) ? 'yes' : 'no').PHP_EOL;
