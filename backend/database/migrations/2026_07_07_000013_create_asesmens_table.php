<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asesmens', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->foreignId('kompetensi_id')->constrained('kompetensis')->cascadeOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->integer('jumlah_soal')->default(0);
            $table->integer('durasi')->default(60);
            $table->decimal('nilai_lulus', 5, 2)->default(60);
            $table->boolean('acak_soal')->default(true);
            $table->boolean('acak_jawaban')->default(true);
            $table->timestamp('tanggal_mulai')->nullable();
            $table->timestamp('tanggal_selesai')->nullable();
            $table->enum('status', ['draft', 'published', 'ongoing', 'finished'])->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('kompetensi_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asesmens');
    }
};
