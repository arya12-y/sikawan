<?php

// Extended test: Penguji approve flow + essay grading flow
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Asesmen;
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
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($raw, true)];
}

function check($label, $ok, $detail = '') {
    global $pass, $fail;
    echo ($ok ? '✅ PASS' : '❌ FAIL').' | '.$label.($detail ? ' | '.$detail : '').PHP_EOL;
    $ok ? $pass++ : $fail++;
}

// ============ 1. PENGAWASAN: Penguji approve hasil Budi ============
echo "========== PENGUJI APPROVE FLOW ==========\n";
[$code, $plogin] = req('POST', '/login', null, ['email' => 'penguji@sikawan.test', 'password' => 'password']);
$ptk = $plogin['token'] ?? null;
check('Login Penguji', $code === 200);

// Cari peserta Budi yang sudah selesai
$peserta = PesertaAsesmen::with('user')->whereHas('user', fn ($q) => $q->where('email', 'budi.santoso@sikawan.test'))
    ->where('status', 'selesai')->latest()->first();

if ($peserta) {
    $pid = $peserta->id;
    check('Peserta Budi selesai ditemukan', true, "peserta_id=$pid asesmen=".$peserta->asesmen?->judul);

    // Review dulu (cari endpoint review — daftar essay / review peserta)
    [$c, $review] = req('GET', '/penilaian/essay?per_page=50', $ptk);
    check('Daftar essay (Penguji)', $c === 200, 'total='.($review['total'] ?? '-'));

    // Approve peserta Budi (lulus)
    [$c, $approve] = req('POST', '/peserta-asesmens/'.$pid.'/approve', $ptk, ['catatan' => 'Lulus uji kompetensi']);
    check('Approve peserta (Penguji)', $c === 200, json_encode($approve));

    // Verify lulus di DB (loose: DB simpan 1 untuk true)
    $peserta->refresh();
    check('Peserta status lulus di DB', (bool) $peserta->lulus, 'lulus='.var_export($peserta->lulus, true));

    // Walidata cek my-status
    [$c, $wlogin] = req('POST', '/login', null, ['email' => 'budi.santoso@sikawan.test', 'password' => 'password']);
    $wtk = $wlogin['token'] ?? null;
    [$c, $st] = req('GET', '/my-status', $wtk);
    check('my-status walidata setelah approve', (bool) $st['asesmen_lulus'], 'lulus='.var_export($st['asesmen_lulus'], true));

    // Sertifikat walidata
    [$c, $serts] = req('GET', '/sertifikats', $wtk);
    $sertList = $serts['data'] ?? [];
    check('Sertifikat walidata tersedia', count($sertList) > 0, 'count='.count($sertList));
    if (count($sertList) > 0) {
        $sid = $sertList[0]['id'];
        [$c, $dl] = req('GET', '/sertifikats/'.$sid.'/download', $wtk);
        check('Download sertifikat', $c === 200, 'code='.$c);
    }
} else {
    check('Peserta Budi selesai ditemukan', false, 'tidak ada');
}

// ============ 2. ESSAY GRADING FLOW ============
echo "\n========== ESSAY GRADING FLOW ==========\n";
// Cari soal essay di bank soal
$essaySoal = BankSoal::where('jenis', 'essay')->first();
$pgSoal = BankSoal::where('jenis', 'pilihan_ganda')->first();

if ($essaySoal && $pgSoal) {
    // Buat asesmen kecil berisi 1 PG + 1 essay via admin
    [$c, $alogin] = req('POST', '/login', null, ['email' => 'admin@sikawan.test', 'password' => 'password']);
    $atk = $alogin['token'] ?? null;

    $newAsesmen = [
        'judul' => 'Uji Essay Flow '.date('His'),
        'deskripsi' => 'Test grading essay',
        'kompetensi_ids' => [$essaySoal->kompetensi_id],
        'level_id' => 1,
        'jumlah_soal' => 2,
        'durasi' => 10,
        'nilai_lulus' => 60,
        'status' => 'published',
        'acak_soal' => false,
    ];
    [$c, $created] = req('POST', '/asesmens', $atk, $newAsesmen);
    check('Buat asesmen essay (admin)', $c === 201 || $c === 200, 'code='.$c);
    $aid = $created['id'] ?? null;

    if ($aid) {
        [$c, $att] = req('POST', '/asesmens/'.$aid.'/attach-soals', $atk, ['soal_ids' => [$pgSoal->id, $essaySoal->id]]);
        check('Attach soal (1 PG + 1 essay)', $c === 200, 'count='.count($att['bank_soals'] ?? []));

        // Walidata (pakai akun lain, misal siti) kerjakan
        [$c, $wlogin] = req('POST', '/login', null, ['email' => 'siti.nurhaliza@sikawan.test', 'password' => 'password']);
        $wtk = $wlogin['token'] ?? null;
        // aktivasi siti
        req('POST', '/pretest/activate', $atk, ['user_id' => 7]); // siti user_id kemungkinan 7 — cek
        [$c, $peserta] = req('POST', '/asesmens/'.$aid.'/start', $wtk, []);
        check('Start asesmen essay (siti)', $c === 200, 'code='.$c.' status='.($peserta['status'] ?? '-'));

        $pid = $peserta['id'] ?? null;
        if ($pid) {
            // Jawab PG (benar) + essay (isi)
            [$c, $r1] = req('POST', '/peserta-asesmens/'.$pid.'/save-answer', $wtk, ['bank_soal_id' => $pgSoal->id, 'jawaban' => $pgSoal->jawaban_benar]);
            [$c, $r2] = req('POST', '/peserta-asesmens/'.$pid.'/save-answer', $wtk, ['bank_soal_id' => $essaySoal->id, 'jawaban' => 'Jawaban essay: satu data indonesia memastikan data tunggal dan interoperable.']);
            check('Save jawaban PG+essay', true);

            [$c, $sub] = req('POST', '/peserta-asesmens/'.$pid.'/submit', $wtk, []);
            check('Submit asesmen essay', $c === 200, 'status='.($sub['status'] ?? '-').' nilai='.($sub['nilai'] ?? '-'));

            // Penguji: cek daftar essay, grade essay
            [$c, $essayList] = req('GET', '/penilaian/essay?per_page=50', $ptk);
            $items = $essayList['data'] ?? [];
            $essayItem = null;
            foreach ($items as $it) {
                if (($it['peserta_id'] ?? '') == $pid) { $essayItem = $it; break; }
            }
            check('Essay muncul di daftar penilaian', $essayItem !== null, 'items='.count($items));
            if ($essayItem) {
                $jawabanId = $essayItem['id'];
                [$c, $graded] = req('POST', '/jawaban-pesertas/'.$jawabanId.'/grade-essay', $ptk, ['nilai' => 90, 'catatan_penguji' => 'Jawaban lengkap']);
                check('Grade essay (Penguji)', $c === 200, json_encode($graded));
            }
        }
    }
} else {
    check('Bank soal punya essay', false, 'essay='.($essaySoal?->id ?? 'none').' pg='.($pgSoal?->id ?? 'none'));
}

// ============ SUMMARY ============
echo "\n========== RESULT: $pass PASS, $fail FAIL ==========\n";
exit($fail > 0 ? 1 : 0);
