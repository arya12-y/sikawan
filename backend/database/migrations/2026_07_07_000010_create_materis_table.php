<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kompetensi_id')->constrained('kompetensis')->cascadeOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategoris')->nullOnDelete();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('jenis', ['video', 'pdf', 'presentasi', 'dokumen'])->default('pdf');
            $table->string('file_path')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('url_video')->nullable();
            $table->integer('durasi')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('kompetensi_id');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materis');
    }
};
