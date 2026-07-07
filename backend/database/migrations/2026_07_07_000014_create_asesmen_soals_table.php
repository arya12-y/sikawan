<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asesmen_soals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asesmen_id')->constrained('asesmens')->cascadeOnDelete();
            $table->foreignId('bank_soal_id')->constrained('bank_soals')->cascadeOnDelete();
            $table->integer('urutan')->default(0);
            $table->timestamps();

            $table->unique(['asesmen_id', 'bank_soal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asesmen_soals');
    }
};
