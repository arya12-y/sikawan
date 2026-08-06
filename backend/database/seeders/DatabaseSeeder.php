<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            MasterDataSeeder::class,
            // TrainingDataSeeder dinonaktifkan: menulis nilai kompetensi acak (kategori "Seed Data")
            // yang mengotori dashboard. Data harus real dari asesmen.
            TestDataSeeder::class,
            SyncDataSeeder::class,
        ]);
    }
}
