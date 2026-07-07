<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sertifikats', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sertifikat')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('asesmen_id')->nullable()->constrained('asesmens')->nullOnDelete();
            $table->foreignId('kompetensi_id')->constrained('kompetensis')->cascadeOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->decimal('nilai_akhir', 5, 2)->default(0);
            $table->string('kategori_kompetensi')->nullable();
            $table->date('tanggal_terbit');
            $table->date('tanggal_expired')->nullable();
            $table->string('file_path')->nullable();
            $table->string('qr_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('nomor_sertifikat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sertifikats');
    }
};
