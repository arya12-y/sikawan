<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE peserta_asesmens MODIFY COLUMN status ENUM('belum_mulai','sedang_mengerjakan','selesai','dinilai','menunggu_dinilai','wawancara') NOT NULL DEFAULT 'belum_mulai'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE peserta_asesmens MODIFY COLUMN status ENUM('belum_mulai','sedang_mengerjakan','selesai','dinilai') NOT NULL DEFAULT 'belum_mulai'");
    }
};
