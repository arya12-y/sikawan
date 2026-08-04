<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Materi;
use App\Models\MateriProgress;
use App\Models\User;
use App\Models\Walidata;

// Simulasi: walidata@sikawan.test (level Dasar) selesaikan materi #20 via download (progress 100)
$user = User::where('email', 'walidata@sikawan.test')->first();
$walidata = $user?->walidata;

echo 'Sebelum: level='.($walidata?->level?->nama ?? '-').' (urutan '.($walidata?->level?->urutan ?? '-').')'.PHP_EOL;

// materi di level Dasar
$level = $walidata?->level;
if ($level) {
    $total = Materi::where('level_id', $level->id)->where('is_published', true)->count();
    $completed = MateriProgress::where('user_id', $user->id)->where('is_completed', true)
        ->whereIn('materi_id', Materi::where('level_id', $level->id)->pluck('id'))->count();
    echo "Level {$level->nama}: total=$total completed=$completed".PHP_EOL;

    // materi level ini yang belum completed
    $belum = Materi::where('level_id', $level->id)->where('is_published', true)
        ->whereDoesntHave('progress', fn ($q) => $q->where('user_id', $user->id)->where('is_completed', true))
        ->get(['id', 'judul']);
    echo 'Belum selesai: '.$belum->count().PHP_EOL;
    foreach ($belum as $m) {
        echo '  #'.$m->id.' '.$m->judul.' (soal='.$m->soals_count.')'.PHP_EOL;
    }
}

// Selesaikan materi #20 (yang tidak punya soal) via download
$m20 = Materi::find(20);
if ($m20) {
    MateriProgress::updateOrCreate(
        ['user_id' => $user->id, 'materi_id' => $m20->id],
        ['progress' => 100, 'is_completed' => true, 'completed_at' => now()]
    );
    echo PHP_EOL.'Set #20 selesai (simulasi download)'.PHP_EOL;

    // re-check level-up
    $walidata->refresh();
    $level2 = $walidata->level;
    $total2 = Materi::where('level_id', $level2->id)->where('is_published', true)->count();
    $completed2 = MateriProgress::where('user_id', $user->id)->where('is_completed', true)
        ->whereIn('materi_id', Materi::where('level_id', $level2->id)->pluck('id'))->count();
    echo "Level {$level2->nama}: total=$total2 completed=$completed2".PHP_EOL;

    if ($total2 > 0 && $completed2 >= $total2) {
        $next = \App\Models\Level::where('urutan', $level2->urutan + 1)->first();
        if ($next) {
            $walidata->update(['level_id' => $next->id]);
            echo 'LEVEL UP! -> '.$next->nama.PHP_EOL;
        }
    }
    $walidata->refresh();
    echo 'Sesudah: level='.($walidata->level?->nama ?? '-').PHP_EOL;
}
