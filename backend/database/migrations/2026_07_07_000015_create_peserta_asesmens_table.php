<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peserta_asesmens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asesmen_id')->constrained('asesmens')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->decimal('nilai', 5, 2)->nullable();
            $table->enum('status', ['belum_mulai', 'sedang_mengerjakan', 'selesai', 'dinilai'])->default('belum_mulai');
            $table->boolean('lulus')->nullable();
            $table->timestamps();

            $table->unique(['asesmen_id', 'user_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peserta_asesmens');
    }
};
