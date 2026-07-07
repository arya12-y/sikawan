<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('walidatas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('opd_id')->constrained('opds')->cascadeOnDelete();
            $table->foreignId('bidang_id')->nullable()->constrained('bidangs')->nullOnDelete();
            $table->foreignId('jabatan_id')->nullable()->constrained('jabatans')->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->string('nip', 20)->nullable();
            $table->decimal('nilai_kompetensi', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('opd_id');
            $table->index('level_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('walidatas');
    }
};
