<?php

namespace Database\Seeders;

use App\Models\Asesmen;
use App\Models\BankSoal;
use App\Models\Materi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SyncDataSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->records('bank_soals') as $record) {
            $id = $record['id'];
            unset($record['id']);
            BankSoal::withTrashed()->updateOrCreate(['id' => $id], $record)->restore();
        }

        $target = storage_path('app/public/materi');
        File::ensureDirectoryExists($target);
        foreach ($this->records('materis') as $record) {
            $id = $record['id'];
            if (!empty($record['file_path']) && str_starts_with($record['file_path'], 'seed-files/')) {
                $source = database_path('seeders/files/'.substr($record['file_path'], strlen('seed-files/')));
                $filename = basename($source);
                if (File::exists($source)) {
                    File::copy($source, $target.'/'.$filename);
                    $record['file_path'] = 'materi/'.$filename;
                }
            }
            unset($record['id']);
            Materi::withTrashed()->updateOrCreate(['id' => $id], $record)->restore();
        }

        foreach ($this->records('asesmens') as $record) {
            $id = $record['id'];
            $kompetensiIds = $record['kompetensi_ids'] ?? [];
            unset($record['id'], $record['kompetensi_ids']);
            $asesmen = Asesmen::withTrashed()->updateOrCreate(['id' => $id], $record);
            $asesmen->kompetensi_ids = $kompetensiIds;
            $asesmen->save();
        }
    }

    private function records(string $name): array
    {
        $json = file_get_contents(database_path("seeders/data/{$name}.json"));
        return json_decode(ltrim($json, "\xEF\xBB\xBF"), true, 512, JSON_THROW_ON_ERROR);
    }
}
