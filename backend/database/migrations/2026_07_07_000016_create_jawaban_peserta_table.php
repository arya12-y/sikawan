<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jawaban_pesertas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_asesmen_id')->constrained('peserta_asesmens')->cascadeOnDelete();
            $table->foreignId('bank_soal_id')->constrained('bank_soals')->cascadeOnDelete();
            $table->text('jawaban')->nullable();
            $table->boolean('is_benar')->nullable();
            $table->decimal('nilai', 5, 2)->nullable();
            $table->text('catatan_penguji')->nullable();
            $table->foreignId('dinilai_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dinilai_at')->nullable();
            $table->timestamps();

            $table->unique(['peserta_asesmen_id', 'bank_soal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jawaban_pesertas');
    }
};
