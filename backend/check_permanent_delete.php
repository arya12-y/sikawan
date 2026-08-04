<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\BankSoal;
use App\Models\Bidang;
use App\Models\Kategori;
use App\Models\Level;
use App\Models\Opd;
use Spatie\Permission\Models\Role;

$base = 'http://localhost/api';
$request = function (string $method, string $url, ?string $token = null, ?array $body = null): array {
    $curl = curl_init($url);
    $headers = ['Accept: application/json', 'Content-Type: application/json'];
    if ($token) $headers[] = 'Authorization: Bearer '.$token;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
    $raw = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    return [$code, json_decode($raw ?: '{}', true) ?: []];
};
[$loginCode, $login] = $request('POST', $base.'/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$token = $login['token'] ?? null;
$check = function (string $label, int $code, $model, int $id): void { echo (($code === 200 && !$model::withTrashed()->find($id)) ? 'PASS' : 'FAIL')." | {$label} | HTTP={$code} id={$id} remaining=".($model::withTrashed()->find($id) ? 'yes' : 'no').PHP_EOL; };

[$code, $data] = $request('POST', $base.'/opds', $token, ['nama' => 'OPD Permanent Test', 'kode' => 'OPDPERM'.uniqid()]); $id = $data['id'] ?? null; [$delete] = $request('DELETE', $base.'/opds/'.$id, $token); $check('OPD', $delete, Opd::class, $id);
[$code, $data] = $request('POST', $base.'/bidangs', $token, ['nama' => 'Bidang Permanent Test', 'opd_id' => Opd::first()->id]); $id = $data['id'] ?? null; [$delete] = $request('DELETE', $base.'/bidangs/'.$id, $token); $check('Bidang', $delete, Bidang::class, $id);
[$code, $data] = $request('POST', $base.'/roles', $token, ['name' => 'Permanent Test '.uniqid(), 'permissions' => []]); $id = $data['id'] ?? null; [$delete] = $request('DELETE', $base.'/roles/'.$id, $token); echo (($delete === 200 && !Role::find($id)) ? 'PASS' : 'FAIL')." | Role | HTTP={$delete} id={$id}".PHP_EOL;
$soal = BankSoal::where('is_active', true)->firstOrFail(); [$code, $data] = $request('POST', $base.'/bank-soals', $token, ['kompetensi_id' => $soal->kompetensi_id, 'level_id' => $soal->level_id, 'jenis' => 'pilihan_ganda', 'tipe' => ['quiz'], 'pertanyaan' => 'Soal Permanent Test '.uniqid(), 'pilihan' => ['A', 'B', 'C', 'D'], 'jawaban_benar' => 'A', 'bobot' => 1, 'is_active' => true]); $id = $data['id'] ?? null; [$delete] = $request('DELETE', $base.'/bank-soals/'.$id, $token); $check('BankSoal', $delete, BankSoal::class, $id);
