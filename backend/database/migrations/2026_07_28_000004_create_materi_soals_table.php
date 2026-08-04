<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_soals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materi_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_soal_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['materi_id', 'bank_soal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_soals');
    }
};
