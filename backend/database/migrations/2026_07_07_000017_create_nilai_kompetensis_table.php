<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nilai_kompetensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('kompetensi_id')->constrained('kompetensis')->cascadeOnDelete();
            $table->foreignId('asesmen_id')->nullable()->constrained('asesmens')->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->decimal('nilai', 5, 2)->default(0);
            $table->string('kategori')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'kompetensi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nilai_kompetensis');
    }
};
