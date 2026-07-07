<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kode', 20)->unique();
            $table->integer('urutan')->default(0);
            $table->decimal('nilai_min', 5, 2)->default(0);
            $table->decimal('nilai_max', 5, 2)->default(100);
            $table->string('warna', 7)->default('#000000');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('levels');
    }
};
