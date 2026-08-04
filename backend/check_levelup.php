<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\User;

echo '--- WALIDATA LEVEL SAAT INI ---'.PHP_EOL;
foreach (User::whereHas('roles', fn ($q) => $q->where('name', 'Walidata')->where('guard_name', 'sanctum'))->with('walidata.level')->get() as $u) {
    echo $u->email.' | level_id='.($u->walidata?->level_id ?? '-').' | level='.($u->walidata?->level?->nama ?? '-').' urutan='.($u->walidata?->level?->urutan ?? '-').PHP_EOL;
}

echo PHP_EOL.'--- MATERI PER LEVEL (published) ---'.PHP_EOL;
foreach (Materi::where('is_published', true)->with('level')->get()->groupBy('level_id') as $lid => $list) {
    echo 'Level '.($list->first()->level?->nama ?? $lid).': '.$list->count().' materi'.PHP_EOL;
    foreach ($list as $m) {
        echo '  #'.$m->id.' '.$m->judul.' (soal='.$m->soals()->count().')'.PHP_EOL;
    }
}

echo PHP_EOL.'--- PROGRESS AGUS (misal user yang baru test) ---'.PHP_EOL;
foreach (User::whereHas('roles', fn ($q) => $q->where('name', 'Walidata')->where('guard_name', 'sanctum'))->get() as $u) {
    $prog = MateriProgress::where('user_id', $u->id)->get();
    if ($prog->isEmpty()) continue;
    echo $u->email.' (level '.($u->walidata?->level?->nama ?? '-').'):'.PHP_EOL;
    foreach ($prog as $p) {
        $m = Materi::find($p->materi_id);
        echo '  materi#'.$p->materi_id.' '.($m?->judul ?? '?').' progress='.$p->progress.' completed='.($p->is_completed ? 'true' : 'false').PHP_EOL;
    }
}
