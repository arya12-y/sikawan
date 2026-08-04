<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\ExamSchedule;
use App\Models\Materi;
use App\Models\Level;
use App\Models\Walidata;

$soals = BankSoal::all();
echo 'BankSoal total: '.$soals->count().PHP_EOL;
echo 'BankSoal pretest: '.$soals->filter(fn ($s) => in_array('pretest', $s->tipe ?? [], true))->count().PHP_EOL;
echo 'BankSoal asesmen: '.$soals->filter(fn ($s) => in_array('asesmen', $s->tipe ?? [], true))->count().PHP_EOL;
echo 'ExamSchedule total: '.ExamSchedule::count().PHP_EOL;
foreach (ExamSchedule::orderBy('id')->get(['title', 'is_active']) as $schedule) echo "- {$schedule->title} / is_active=".($schedule->is_active ? 'true' : 'false').PHP_EOL;
echo 'Asesmen total: '.Asesmen::count().PHP_EOL;
foreach (Asesmen::withCount('bankSoals')->orderBy('id')->get(['judul', 'jumlah_soal']) as $asesmen) echo "- {$asesmen->judul} / jumlah_soal={$asesmen->jumlah_soal} / attached={$asesmen->bank_soals_count}".PHP_EOL;
echo 'Walidata total: '.Walidata::count().PHP_EOL;
foreach (Walidata::with('user')->whereHas('user', fn ($query) => $query->where('email', 'like', '%@sikawan.test'))->orderBy('id')->get() as $walidata) echo "- {$walidata->user->email} / {$walidata->user->name} / NIP={$walidata->nip}".PHP_EOL;
echo 'Materi total: '.Materi::count().PHP_EOL;
foreach (Materi::selectRaw('jenis, count(*) as total')->groupBy('jenis')->orderBy('jenis')->get() as $row) echo "- {$row->jenis}: {$row->total}".PHP_EOL;
echo 'Materi per level:'.PHP_EOL;
foreach (Level::orderBy('id')->get() as $level) echo "- {$level->id} {$level->nama}: ".Materi::where('level_id', $level->id)->where('is_published', true)->count().PHP_EOL;
