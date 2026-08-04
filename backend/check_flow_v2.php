<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PesertaAsesmen;
use App\Models\Sertifikat;
use App\Models\Wawancara;

echo "PesertaAsesmen statuses:\n";
foreach (PesertaAsesmen::selectRaw('status, count(*) as total')->groupBy('status')->orderBy('status')->get() as $row) echo "- {$row->status}: {$row->total}\n";
echo 'Wawancara rows: '.Wawancara::count().PHP_EOL;
foreach (Wawancara::orderBy('id')->get(['id', 'peserta_asesmen_id', 'status', 'rekomendasi']) as $row) echo "- #{$row->id} peserta={$row->peserta_asesmen_id} status={$row->status} rekomendasi=".($row->rekomendasi ?? '-').PHP_EOL;
echo 'Sertifikat rows: '.Sertifikat::count().PHP_EOL;
