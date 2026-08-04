<?php
// Role-by-role e2e test: Super Admin, Admin Diskominfo, Pimpinan, Penguji, Walidata
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$BASE = 'http://localhost/api';
$pass = 0;
$fail = 0;

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
function check($label, $ok, $detail = '') {
    global $pass, $fail;
    echo ($ok ? 'PASS' : 'FAIL')." | $label".($detail ? " | $detail" : '').PHP_EOL;
    $ok ? $pass++ : $fail++;
}
function checkStatus($label, $want, $got, $detail = '') {
    $ok = in_array($got, (array) $want, true);
    echo ($ok ? 'PASS' : 'FAIL')." | $label | expected=".implode('/', (array) $want)." got=$got".($detail ? " | $detail" : '').PHP_EOL;
    global $pass, $fail;
    $ok ? $pass++ : $fail++;
}

$login = function ($email) {
    [$c, $d] = req('POST', '/login', null, ['email' => $email, 'password' => 'password']);
    return [$c, $d, $d['token'] ?? null, $d['user'] ?? []];
};

// ============================================================
echo "=== 1. SUPER ADMIN ===";
[$c, $d, $tk, $user] = $login('admin@sikawan.test');
checkStatus('login', 200, $c);
$h = $tk;
check('roles contains Super Admin', in_array('Super Admin', $user['roles'] ?? [], true), json_encode($user['roles'] ?? []));

// Master data CRUD
[$c, $d] = req('GET', '/opds?per_page=5', $h);  checkStatus('GET opds', 200, $c);
[$c, $d] = req('GET', '/bidangs?per_page=5', $h);  checkStatus('GET bidangs', 200, $c);
[$c, $d] = req('GET', '/jabatans?per_page=5', $h); checkStatus('GET jabatans', 200, $c);
[$c, $d] = req('GET', '/kompetensis?per_page=5', $h); checkStatus('GET kompetensis', 200, $c);
[$c, $d] = req('GET', '/levels?per_page=5', $h); checkStatus('GET levels', 200, $c);
[$c, $d] = req('GET', '/badges?per_page=5', $h); checkStatus('GET badges', 200, $c);
[$c, $d] = req('GET', '/kategoris?per_page=5', $h); checkStatus('GET kategoris', 200, $c);
[$c, $d] = req('GET', '/walidatas?per_page=5', $h); checkStatus('GET walidatas', 200, $c);
[$c, $d] = req('GET', '/pengujis?per_page=5', $h); checkStatus('GET pengujis', 200, $c);
// Users & RBAC
[$c, $d] = req('GET', '/users?per_page=5', $h); checkStatus('GET users', 200, $c);
[$c, $d] = req('GET', '/roles', $h); checkStatus('GET roles', 200, $c);
[$c, $d] = req('GET', '/permissions', $h); checkStatus('GET permissions', 200, $c);
// Master CRUD write (create temp OPD then delete)
[$c, $d] = req('POST', '/opds', $h, ['nama' => 'OPD Test E2E', 'kode' => 'OPDTEST'.date('His'), 'is_active' => true]);
$newId = $d['id'] ?? null;
checkStatus('POST opds (create)', [200, 201], $c, 'id='.($newId ?? '-'));
if ($newId) {
    [$c, $d] = req('DELETE', '/opds/'.$newId, $h);
    checkStatus('DELETE opds', 200, $c);
}
// Bank soal & materi & asesmen & jadwal
[$c, $d] = req('GET', '/bank-soals?per_page=5', $h); checkStatus('GET bank-soals', 200, $c);
[$c, $d] = req('GET', '/materis?per_page=5', $h); checkStatus('GET materis', 200, $c);
[$c, $d] = req('GET', '/asesmens?per_page=5', $h); checkStatus('GET asesmens', 200, $c);
[$c, $d] = req('GET', '/exam-schedules', $h); checkStatus('GET exam-schedules', 200, $c);
[$c, $d] = req('GET', '/exam-schedules/stats', $h); checkStatus('GET exam-schedules/stats', 200, $c);
// Monitoring & laporan & sertifikat & audit
[$c, $d] = req('GET', '/monitoring?per_page=5', $h); checkStatus('GET monitoring', 200, $c);
[$c, $d] = req('GET', '/pretest/monitoring', $h); checkStatus('GET pretest/monitoring', 200, $c);
[$c, $d] = req('GET', '/laporan/asesmen', $h); checkStatus('GET laporan/asesmen', 200, $c);
[$c, $d] = req('GET', '/laporan/sertifikat', $h); checkStatus('GET laporan/sertifikat', 200, $c);
[$c, $d] = req('GET', '/audit-logs?per_page=5', $h); checkStatus('GET audit-logs (Super Admin)', 200, $c);
[$c, $d] = req('GET', '/sertifikats', $h); checkStatus('GET sertifikats', 200, $c);
[$c, $d] = req('GET', '/sessions', $h); checkStatus('GET sessions', 200, $c);
[$c, $d] = req('GET', '/dashboard', $h); checkStatus('GET dashboard', 200, $c);
[$c, $d] = req('GET', '/notifikasis?per_page=5', $h); checkStatus('GET notifikasis', 200, $c);

// ============================================================
echo "\n=== 2. ADMIN DISKOMINFO ===";
[$c, $d, $tk] = $login('diskominfo@sikawan.test');
checkStatus('login', 200, $c);
$h = $tk;
[$c, $d] = req('GET', '/users?per_page=5', $h); checkStatus('GET users', 200, $c);
[$c, $d] = req('GET', '/roles', $h); checkStatus('GET roles', 200, $c);
[$c, $d] = req('GET', '/opds?per_page=5', $h); checkStatus('GET opds', 200, $c);
[$c, $d] = req('GET', '/bank-soals?per_page=5', $h); checkStatus('GET bank-soals', 200, $c);
[$c, $d] = req('GET', '/materis?per_page=5', $h); checkStatus('GET materis', 200, $c);
[$c, $d] = req('GET', '/asesmens?per_page=5', $h); checkStatus('GET asesmens', 200, $c);
[$c, $d] = req('GET', '/exam-schedules', $h); checkStatus('GET exam-schedules', 200, $c);
[$c, $d] = req('GET', '/monitoring?per_page=5', $h); checkStatus('GET monitoring', 200, $c);
[$c, $d] = req('GET', '/laporan/asesmen', $h); checkStatus('GET laporan/asesmen', 200, $c);
// audit-log harus 403 (kecuali Super Admin)
[$c, $d] = req('GET', '/audit-logs?per_page=5', $h);
checkStatus('GET audit-logs (harus 403)', 403, $c, $d['message'] ?? '');

// ============================================================
echo "\n=== 3. PIMPINAN ===";
[$c, $d, $tk] = $login('pimpinan@sikawan.test');
checkStatus('login', 200, $c);
$h = $tk;
[$c, $d] = req('GET', '/dashboard', $h); checkStatus('GET dashboard', 200, $c);
[$c, $d] = req('GET', '/monitoring?per_page=5', $h); checkStatus('GET monitoring', 200, $c);
[$c, $d] = req('GET', '/laporan/asesmen', $h); checkStatus('GET laporan/asesmen', 200, $c);
[$c, $d] = req('GET', '/laporan/sertifikat', $h); checkStatus('GET laporan/sertifikat', 200, $c);
[$c, $d] = req('GET', '/audit-logs?per_page=5', $h); checkStatus('GET audit-logs (Pimpinan)', 200, $c);
[$c, $d] = req('GET', '/sertifikats', $h); checkStatus('GET sertifikats', 200, $c);
// Pimpinan TIDAK boleh akses master data / users / bank soal
[$c, $d] = req('GET', '/opds?per_page=5', $h); checkStatus('GET opds (harus 403)', 403, $c);
[$c, $d] = req('GET', '/users?per_page=5', $h); checkStatus('GET users (harus 403)', 403, $c);
[$c, $d] = req('GET', '/bank-soals?per_page=5', $h); checkStatus('GET bank-soals (harus 403)', 403, $c);
[$c, $d] = req('GET', '/asesmens?per_page=5', $h); checkStatus('GET asesmens (harus 403)', 403, $c);

// ============================================================
echo "\n=== 4. PENGUJI ===";
[$c, $d, $tk] = $login('penguji@sikawan.test');
checkStatus('login', 200, $c);
$h = $tk;
[$c, $d] = req('GET', '/bank-soals?per_page=5', $h); checkStatus('GET bank-soals', 200, $c);
[$c, $d] = req('POST', '/bank-soals', $h, ['kompetensi_id' => 1, 'level_id' => 1, 'jenis' => 'pilihan_ganda', 'tipe' => ['quiz'], 'pertanyaan' => 'Soal uji penguji?', 'pilihan' => ['A', 'B', 'C', 'D'], 'jawaban_benar' => 'A', 'bobot' => 1, 'is_active' => true]);
$newSoal = $d['id'] ?? null;
checkStatus('POST bank-soals (create)', [200, 201], $c, 'id='.($newSoal ?? '-'));
if ($newSoal) {
    [$c, $d] = req('DELETE', '/bank-soals/'.$newSoal, $h);
    checkStatus('DELETE bank-soals', 200, $c);
}
[$c, $d] = req('GET', '/penilaian/essay?per_page=5', $h); checkStatus('GET penilaian/essay', 200, $c);
[$c, $d] = req('GET', '/penilaian/wawancara?per_page=5', $h); checkStatus('GET penilaian/wawancara', 200, $c);
[$c, $d] = req('GET', '/monitoring?per_page=5', $h); checkStatus('GET monitoring', 200, $c);
[$c, $d] = req('GET', '/materis?per_page=5', $h); checkStatus('GET materis', 200, $c);
// Penguji TIDAK boleh asesmen CRUD / users / master
[$c, $d] = req('GET', '/asesmens?per_page=5', $h); checkStatus('GET asesmens (harus 403)', 403, $c);
[$c, $d] = req('GET', '/users?per_page=5', $h); checkStatus('GET users (harus 403)', 403, $c);
[$c, $d] = req('GET', '/opds?per_page=5', $h); checkStatus('GET opds (harus 403)', 403, $c);

// ============================================================
echo "\n=== 5. WALIDATA ===";
[$c, $d, $tk] = $login('walidata@sikawan.test');
checkStatus('login', 200, $c);
$h = $tk;
[$c, $d] = req('GET', '/my-status', $h); checkStatus('GET my-status', 200, $c, 'phase='.($d['phase'] ?? '-'));
[$c, $d] = req('GET', '/materis?per_page=5', $h); checkStatus('GET materis', 200, $c);
[$c, $d] = req('GET', '/asesmens?per_page=5', $h); checkStatus('GET asesmens', 200, $c);
[$c, $d] = req('GET', '/sertifikats', $h); checkStatus('GET sertifikats', 200, $c);
[$c, $d] = req('GET', '/notifikasis?per_page=5', $h); checkStatus('GET notifikasis', 200, $c);
// Walidata TIDAK boleh: users, roles, opds, bank-soals, monitoring, laporan
[$c, $d] = req('GET', '/users?per_page=5', $h); checkStatus('GET users (harus 403)', 403, $c);
[$c, $d] = req('GET', '/roles', $h); checkStatus('GET roles (harus 403)', 403, $c);
[$c, $d] = req('GET', '/opds?per_page=5', $h); checkStatus('GET opds (harus 403)', 403, $c);
[$c, $d] = req('GET', '/bank-soals?per_page=5', $h); checkStatus('GET bank-soals (harus 403)', 403, $c);
[$c, $d] = req('GET', '/monitoring?per_page=5', $h); checkStatus('GET monitoring (harus 403)', 403, $c);
[$c, $d] = req('GET', '/laporan/asesmen', $h); checkStatus('GET laporan (harus 403)', 403, $c);
[$c, $d] = req('GET', '/pretest/pending', $h); checkStatus('GET pretest/pending (harus 403)', 403, $c);

echo "\n== RESULT: $pass PASS, $fail FAIL ==\n";
exit($fail > 0 ? 1 : 0);
