<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\User;

$users = User::whereHas('roles', fn ($q) => $q->where('name', 'Walidata')->where('guard_name', 'sanctum'))->with('walidata.level')->get();

foreach ($users as $u) {
    echo '=== '.$u->email.' ==='.PHP_EOL;
    echo '  level_id='.($u->walidata?->level_id ?? '-').' level='.($u->walidata?->level?->nama ?? '-').' urutan='.($u->walidata?->level?->urutan ?? '-').PHP_EOL;

    // Untuk walidata utama, tampilkan rincian progress per level
    if ($u->email === 'walidata@sikawan.test') {
        foreach (Materi::where('is_published', true)->with('level')->get()->groupBy('level_id') as $lid => $list) {
            $total = $list->count();
            $prog = MateriProgress::where('user_id', $u->id)->where('is_completed', true)
                ->whereIn('materi_id', $list->pluck('id'))->count();
            echo "  Level ".($list->first()->level?->nama ?? $lid).": completed=$prog/$total".PHP_EOL;
            foreach ($list as $m) {
                $p = MateriProgress::where('user_id', $u->id)->where('materi_id', $m->id)->first();
                $st = $p ? "prog={$p->progress} done=".($p->is_completed ? 'Y' : 'N') : 'belum';
                echo "    #{$m->id} {$m->judul} [$st]".PHP_EOL;
            }
        }
    }
    echo PHP_EOL;
}
