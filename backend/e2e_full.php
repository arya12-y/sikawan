<?php
// Comprehensive e2e: full assessment lifecycle v2
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BankSoal;
use App\Models\PesertaAsesmen;

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

// ---- SETUP ----
echo "== SETUP ==\n";
[$c, $alogin] = req('POST', '/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
$atk = $alogin['token'] ?? null;
[$c, $udata] = req('GET', '/users?per_page=200', $atk);
$rows = [];
foreach (($udata['data'] ?? []) as $u) { $rows[$u['email']] = $u; }
check('Setup admin login', $atk !== null);

foreach (['budi.santoso@sikawan.test', 'siti.nurhaliza@sikawan.test', 'agus.prasetyo@sikawan.test'] as $em) {
    $row = $rows[$em] ?? null;
    if (!$row) continue;
    // reset peserta untuk semua asesmen
    $pests = PesertaAsesmen::where('user_id', $row['id'])->get();
    foreach ($pests as $p) req('POST', '/peserta-asesmens/'.$p->id.'/reset', $atk, []);
    req('POST', '/pretest/reset', $atk, ['user_id' => $row['id']]);
    req('POST', '/pretest/activate', $atk, ['user_id' => $row['id']]);
}
echo "  reset done\n";

function walidataFlow($email, $label, $wrongAnswer = false) {
    global $pass, $fail;
    [$c, $wlogin] = req('POST', '/login', null, ['email' => $email, 'password' => 'password']);
    $tk = $wlogin['token'] ?? null;
    check("$label login", $c === 200);
    if (!$tk) return null;

    [$c, $pt] = req('POST', '/pretest/start', $tk, []);
    check("$label pretest start", $c === 200, 'total='.($pt['total'] ?? '-'));
    if ($c !== 200) return null;
    $ids = array_column($pt['soals'] ?? [], 'id');
    $answers = BankSoal::whereIn('id', $ids)->get(['id', 'jawaban_benar'])
        ->map(fn ($s) => ['soal_id' => $s->id, 'jawaban' => $wrongAnswer ? 'X' : $s->jawaban_benar])->values()->all();
    [$c, $sub] = req('POST', '/pretest/submit', $tk, ['sesi_id' => $pt['sesi_id'], 'jawaban' => $answers]);
    check("$label pretest submit", $c === 200, 'rata='.($sub['rata_rata'] ?? '-'));

    [$c, $st] = req('GET', '/my-status', $tk);
    $lid = $st['level_id'] ?? null;
    check("$label level dari pretest", $lid !== null, 'level_id='.($lid ?? '-'));

    [$c, $mat] = req('GET', '/materis?per_page=50&level_id='.$lid, $tk);
    check("$label materi by level", $c === 200, 'count='.count(($mat['data'] ?? [])));

    [$c, $ases] = req('GET', '/asesmens?per_page=50', $tk);
    check("$label list asesmen", $c === 200, 'count='.count(($ases['data'] ?? [])));
    $target = ($ases['data'] ?? [])[0] ?? null;
    if (!$target) return ['tk' => $tk, 'pid' => null, 'asesmen_id' => null];

    [$c, $peserta] = req('POST', '/asesmens/'.$target['id'].'/start', $tk, []);
    check("$label start asesmen", $c === 200, 'status='.($peserta['status'] ?? '-'));
    $pid = $peserta['id'] ?? null;
    $soals = $peserta['asesmen']['bank_soals'] ?? [];
    if ($pid && count($soals) > 0) {
        $ans = BankSoal::whereIn('id', array_column($soals, 'id'))->get(['id', 'jawaban_benar', 'jenis']);
        foreach ($ans as $s) {
            $jaw = $s->jenis === 'essay' ? 'Jawaban essay uji' : ($wrongAnswer ? 'X' : $s->jawaban_benar);
            req('POST', '/peserta-asesmens/'.$pid.'/save-answer', $tk, ['bank_soal_id' => $s->id, 'jawaban' => $jaw]);
        }
        [$c, $subA] = req('POST', '/peserta-asesmens/'.$pid.'/submit', $tk, []);
        check("$label submit asesmen", $c === 200, 'status='.($subA['status'] ?? '-').' (harus menunggu_dinilai)');
        check("$label status menunggu_dinilai", ($subA['status'] ?? '') === 'menunggu_dinilai', $subA['status'] ?? '-');
    }
    return ['tk' => $tk, 'pid' => $pid, 'asesmen_id' => $target['id'] ?? null];
}

// ---- WALIDATA BUDI (lulus via approve) ----
echo "\n== WALIDATA BUDI ==\n";
$budi = walidataFlow('budi.santoso@sikawan.test', 'Budi');
[$c, $st] = req('GET', '/my-status', $budi['tk']);
check('Budi my-status menunggu_dinilai', ($st['menunggu_dinilai'] ?? false) === true, 'status='.($st['asesmen_status'] ?? '-'));

// ---- PENGUJI ----
echo "\n== PENGUJI ==\n";
[$c, $plogin] = req('POST', '/login', null, ['email' => 'penguji@sikawan.test', 'password' => 'password']);
$ptk = $plogin['token'] ?? null;
check('Login Penguji', $c === 200);

[$c, $essays] = req('GET', '/penilaian/essay?per_page=50', $ptk);
$items = $essays['data'] ?? [];
check('Essay Budi di daftar penilaian', count($items) > 0, 'items='.count($items));
foreach ($items as $it) {
    if (($it['peserta_nama'] ?? '') === 'Budi Santoso') {
        [$c, $gr] = req('POST', '/jawaban-pesertas/'.$it['id'].'/grade-essay', $ptk, ['nilai' => 90, 'catatan_penguji' => 'Bagus']);
        check('Grade essay Budi', $c === 200, 'nilai='.($gr['nilai'] ?? '-'));
    }
}
$pBudi = PesertaAsesmen::whereHas('user', fn ($q) => $q->where('email', 'budi.santoso@sikawan.test'))->latest()->first();
[$c, $app] = req('POST', '/peserta-asesmens/'.$pBudi->id.'/approve', $ptk, ['catatan' => 'Lulus']);
check('Approve Budi', $c === 200, ($app['message'] ?? ''));
[$c, $st] = req('GET', '/my-status', $budi['tk']);
check('Budi lulus', (bool) ($st['lulus'] ?? false), 'lulus='.var_export($st['lulus'] ?? null, true));

// ---- WAWANCARA SITI ----
echo "\n== WAWANCARA SITI ==\n";
$siti = walidataFlow('siti.nurhaliza@sikawan.test', 'Siti');
if ($siti['pid']) {
    $waktu = date('Y-m-d H:i:s', strtotime('+1 day'));
    [$c, $waw] = req('POST', '/penilaian/wawancara/'.$siti['pid'].'/jadwal', $ptk, ['waktu_mulai' => $waktu, 'durasi_menit' => 30, 'metode' => 'online']);
    check('Penguji jadwal wawancara', $c === 201 || $c === 200, 'status='.($waw['status'] ?? '-'));
    $wawId = $waw['id'] ?? null;

    [$c, $st2] = req('GET', '/my-status', $siti['tk']);
    check('Siti wawancara_pending', ($st2['wawancara_pending'] ?? false) === true, 'status='.($st2['asesmen_status'] ?? '-'));

    if ($wawId) {
        [$c, $nil] = req('PUT', '/penilaian/wawancara/'.$wawId.'/nilai', $ptk, ['nilai_pemahaman' => 5, 'nilai_komunikasi' => 5, 'nilai_penerapan' => 5, 'nilai_sikap' => 5]);
        check('Penguji nilai wawancara', $c === 200, 'v='.($nil['nilai_pemahaman'] ?? '-'));
        [$c, $sel] = req('POST', '/penilaian/wawancara/'.$wawId.'/selesai', $ptk, ['catatan_wawancara' => 'Siap', 'rekomendasi' => 'lulus']);
        check('Wawancara selesai (lulus)', $c === 200, ($sel['message'] ?? ''));
        [$c, $st3] = req('GET', '/my-status', $siti['tk']);
        check('Siti lulus setelah wawancara', (bool) ($st3['lulus'] ?? false), 'lulus='.var_export($st3['lulus'] ?? null, true));
    }
}

// ---- TOLAK AGUS ----
echo "\n== TOLAK AGUS ==\n";
$agus = walidataFlow('agus.prasetyo@sikawan.test', 'Agus', true);
if ($agus['pid']) {
    [$c, $tlk] = req('POST', '/peserta-asesmens/'.$agus['pid'].'/tolak', $ptk, ['catatan' => 'Kurang']);
    check('Penguji tolak Agus', $c === 200, ($tlk['message'] ?? ''));
    [$c, $st4] = req('GET', '/my-status', $agus['tk']);
    check('Agus lulus=false', ($st4['lulus'] ?? null) === false, 'lulus='.var_export($st4['lulus'] ?? null, true));
    [$c, $mat4] = req('GET', '/materis?per_page=50', $agus['tk']);
    check('Agus akses materi (belajar lagi)', $c === 200, 'count='.count(($mat4['data'] ?? [])));
    [$c, $retry] = req('POST', '/asesmens/'.$agus['asesmen_id'].'/start', $agus['tk'], []);
    check('Agus retake terkunci', $c !== 200, 'code='.$c.' msg='.($retry['message'] ?? '-'));
    [$c, $rst] = req('POST', '/peserta-asesmens/'.$agus['pid'].'/reset', $atk, []);
    check('Admin reset (unlock)', $c === 200, ($rst['message'] ?? ''));
    [$c, $retry2] = req('POST', '/asesmens/'.$agus['asesmen_id'].'/start', $agus['tk'], []);
    check('Agus retake setelah reset', $c === 200, 'status='.($retry2['status'] ?? '-'));
}

// ---- FITUR PENDUKUNG ----
echo "\n== FITUR PENDUKUNG ==\n";
[$c, $mon] = req('GET', '/monitoring', $ptk);
check('Monitoring (Penguji)', $c === 200, 'total='.($mon['total'] ?? '-'));
[$c, $monA] = req('GET', '/monitoring', $atk);
check('Monitoring (Admin)', $c === 200, 'total='.($monA['total'] ?? '-'));
[$c, $ptm] = req('GET', '/pretest/monitoring', $atk);
check('Pretest monitoring (Admin)', $c === 200, 'total='.($ptm['total'] ?? '-'));
[$c, $lap] = req('GET', '/laporan/asesmen', $atk);
check('Laporan asesmen', $c === 200);
[$c, $laps] = req('GET', '/laporan/sertifikat', $atk);
check('Laporan sertifikat', $c === 200);
[$c, $serts] = req('GET', '/sertifikats', $budi['tk']);
$slist = $serts['data'] ?? [];
check('Sertifikat Budi', count($slist) > 0, 'count='.count($slist));
if (count($slist) > 0) {
    [$c, $dl] = req('GET', '/sertifikats/'.$slist[0]['id'].'/download', $budi['tk']);
    check('Download sertifikat Budi', $c === 200, 'code='.$c);
}
[$c, $notif] = req('GET', '/notifikasis?per_page=20', $budi['tk']);
$nl = $notif['data'] ?? [];
$hasLulus = false;
foreach ($nl as $n) { if (str_contains($n['judul'] ?? '', 'Lulus')) $hasLulus = true; }
check('Notifikasi Budi (Lulus)', $hasLulus, 'count='.count($nl));
[$c, $notif2] = req('GET', '/notifikasis?per_page=20', $siti['tk']);
$nl2 = $notif2['data'] ?? [];
$hasWaw = false;
foreach ($nl2 as $n) { if (str_contains($n['judul'] ?? '', 'Wawancara')) $hasWaw = true; }
check('Notifikasi Siti (Wawancara)', $hasWaw, 'count='.count($nl2));

echo "\n== RESULT: $pass PASS, $fail FAIL ==\n";
exit($fail > 0 ? 1 : 0);
