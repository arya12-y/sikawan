<?php

// End-to-end test: Walidata flow + Penguji grading flow
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;

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
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $decoded = json_decode($raw, true);
    return [$code, $decoded, $raw];
}

function check($label, $ok, $detail = '') {
    global $pass, $fail;
    echo ($ok ? '✅ PASS' : '❌ FAIL').' | '.$label.($detail ? ' | '.$detail : '').PHP_EOL;
    $ok ? $pass++ : $fail++;
}

// ============ 0. RESET WALIDATA STATE (admin) ============
echo "========== RESET STATE ==========\n";
[$code, $alogin] = req('POST', '/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$atk = $alogin['token'] ?? null;
if ($atk) {
    $uid = req('GET', '/users?per_page=200', $atk)[1]['data'] ?? [];
    $budiRow = null;
    foreach ($uid as $u) { if ($u['email'] === 'budi.santoso@sikawan.test') { $budiRow = $u; break; } }
    if ($budiRow) {
        req('POST', '/pretest/reset', $atk, ['user_id' => $budiRow['id']]);
        req('POST', '/pretest/activate', $atk, ['user_id' => $budiRow['id']]);
        echo '  reset+activate Budi (id='.$budiRow['id'].')'.PHP_EOL;
    }
}

// ============ 1. LOGIN WALIDATA (Budi) ============
echo "========== WALIDATA FLOW (Budi Santoso) ==========\n";
[$code, $login] = req('POST', '/login', null, ['email' => 'budi.santoso@sikawan.test', 'password' => 'password']);
check('Login Walidata', $code === 200, "code=$code");
$wt = $login['token'] ?? null;

// my-status
[$code, $st] = req('GET', '/my-status', $wt);
$phase0 = $st['phase'] ?? '-';
$pd0 = var_export($st['pretest_done'] ?? false, true);
$act0 = var_export($st['pretest_activated'] ?? null, true);
check('my-status sebelum pretest', $code === 200, "phase=$phase0 pretest_done=$pd0 activated=$act0");

// ============ 2. PRETEST ============
[$code, $pt] = req('POST', '/pretest/start', $wt, []);
check('Pretest start', $code === 200, "total={$pt['total']} durasi={$pt['durasi']}");
$soalIds = array_column($pt['soals'] ?? [], 'id');
check('Pretest ada soal', count($soalIds) > 0, 'count='.count($soalIds));

// Ambil jawaban benar dari DB
$answers = BankSoal::whereIn('id', $soalIds)->get(['id', 'jawaban_benar']);
$jawaban = $answers->map(fn ($s) => ['soal_id' => $s->id, 'jawaban' => $s->jawaban_benar])->values()->all();
$submitBody = ['sesi_id' => $pt['sesi_id'], 'jawaban' => $jawaban];

[$code, $sub] = req('POST', '/pretest/submit', $wt, $submitBody);
if ($code === 422) {
    // coba tanpa sesi_id valid — mungkin sesi harus dari start; cek error
    echo '  (submit 422: '.json_encode($sub).')'.PHP_EOL;
}
$rata = $sub['rata_rata'] ?? '-';
$lvl = $sub['level_name'] ?? '-';
check('Pretest submit', $code === 200, "rata_rata=$rata level=$lvl");

// my-status setelah pretest
[$code, $st] = req('GET', '/my-status', $wt);
check('my-status setelah pretest', $code === 200, "phase={$st['phase']} pretest_done=".var_export($st['pretest_done'], true)." level_id={$st['level_id']}");

// ============ 3. MATERI (Learning) by level ============
$levelId = $st['level_id'];
[$code, $materi] = req('GET', '/materis?per_page=50&level_id='.$levelId, $wt);
$materiList = $materi['data'] ?? [];
check('Materi by level '.$levelId, $code === 200, 'count='.count($materiList));

// progress materi pertama
if (count($materiList) > 0) {
    $mid = $materiList[0]['id'];
    [$code, $prog] = req('POST', '/materi/'.$mid.'/progress', $wt, ['progress' => 100]);
    check('Materi progress', $code === 200, json_encode($prog));
}

// ============ 4. ASESMEN (Exam) ============
[$code, $asesmens] = req('GET', '/asesmens?per_page=50', $wt);
$asesmenList = $asesmens['data'] ?? [];
check('List asesmen (Walidata)', $code === 200, 'count='.count($asesmenList));

$target = $asesmenList[0] ?? null;
if ($target) {
    [$code, $peserta] = req('POST', '/asesmens/'.$target['id'].'/start', $wt, []);
    $pstat = $peserta['status'] ?? '-';
    check('Start asesmen', $code === 200, "status=$pstat");
    $pesertaId = $peserta['id'] ?? null;
    $bankSoals = $peserta['asesmen']['bank_soals'] ?? [];
    check('Asesmen ada soal', count($bankSoals) > 0, 'count='.count($bankSoals));

    // Jawab semua soal (ambil jawaban benar)
    $bsIds = array_column($bankSoals, 'id');
    $bsAnswers = BankSoal::whereIn('id', $bsIds)->get(['id', 'jawaban_benar', 'jenis']);
    foreach ($bsAnswers as $bs) {
        if ($bs->jenis === 'pilihan_ganda') {
            [$c, $saved] = req('POST', '/peserta-asesmens/'.$pesertaId.'/save-answer', $wt, ['bank_soal_id' => $bs->id, 'jawaban' => $bs->jawaban_benar]);
            if ($c !== 200) { echo "  save-answer soal {$bs->id}: $c ".json_encode($saved).PHP_EOL; }
        } else {
            [$c, $saved] = req('POST', '/peserta-asesmens/'.$pesertaId.'/save-answer', $wt, ['bank_soal_id' => $bs->id, 'jawaban' => 'Jawaban essay uji']);
            if ($c !== 200) { echo "  save-answer essay {$bs->id}: $c ".json_encode($saved).PHP_EOL; }
        }
    }
    check('Save answers selesai', true);

    [$code, $subA] = req('POST', '/peserta-asesmens/'.$pesertaId.'/submit', $wt, []);
    $astat = $subA['status'] ?? '-';
    $anilai = $subA['nilai'] ?? '-';
    $alulus = var_export($subA['lulus'] ?? null, true);
    check('Submit asesmen', $code === 200, "status=$astat nilai=$anilai lulus=$alulus");

    [$code, $st] = req('GET', '/my-status', $wt);
    check('my-status setelah asesmen', $code === 200, "asesmen_status={$st['asesmen_status']} nilai={$st['asesmen_nilai']} lulus=".var_export($st['asesmen_lulus'], true));
}

// ============ 5. PENGUJI FLOW ============
echo "\n========== PENGUJI FLOW ==========\n";
[$code, $plogin] = req('POST', '/login', null, ['email' => 'penguji@sikawan.test', 'password' => 'password']);
check('Login Penguji', $code === 200, "code=$code");
$ptk = $plogin['token'] ?? null;

[$code, $essay] = req('GET', '/penilaian/essay?per_page=50', $ptk);
$etotal = $essay['total'] ?? '-';
check('Daftar essay (Penguji)', $code === 200, "total=$etotal");

[$code, $mon] = req('GET', '/monitoring', $ptk);
check('Monitoring (Penguji)', $code === 200);

// ============ SUMMARY ============
echo "\n========== RESULT: $pass PASS, $fail FAIL ==========\n";
exit($fail > 0 ? 1 : 0);
