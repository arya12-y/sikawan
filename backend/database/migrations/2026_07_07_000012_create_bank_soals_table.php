<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_soals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kompetensi_id')->constrained('kompetensis')->cascadeOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->enum('jenis', ['pilihan_ganda', 'essay'])->default('pilihan_ganda');
            $table->text('pertanyaan');
            $table->json('pilihan')->nullable();
            $table->text('jawaban_benar')->nullable();
            $table->text('pembahasan')->nullable();
            $table->decimal('bobot', 5, 2)->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('kompetensi_id');
            $table->index('jenis');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_soals');
    }
};
