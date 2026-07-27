<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            $table->index('level_id');
            $table->index('kategori_id');
            $table->index('created_by');
            $table->index('jenis');
            $table->index('urutan');
        });

        Schema::table('bank_soals', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('level_id');
            $table->index('created_by');
            $table->index(['kompetensi_id', 'is_active', 'jenis']);
        });

        Schema::table('asesmens', function (Blueprint $table) {
            $table->index('created_by');
            $table->index('level_id');
            $table->index('tanggal_mulai');
            $table->index('tanggal_selesai');
        });

        Schema::table('pretest_results', function (Blueprint $table) {
            $table->index('completed_at');
            $table->index('sesi_id');
        });

        Schema::table('peserta_asesmens', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('lulus');
            $table->index('created_at');
        });

        Schema::table('jawaban_pesertas', function (Blueprint $table) {
            $table->index('bank_soal_id');
            $table->index('dinilai_oleh');
        });

        Schema::table('nilai_kompetensis', function (Blueprint $table) {
            $table->index('kompetensi_id');
            $table->index('asesmen_id');
        });

        Schema::table('walidatas', function (Blueprint $table) {
            $table->index('nilai_kompetensi');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            $table->dropIndex(['level_id']);
            $table->dropIndex(['kategori_id']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['jenis']);
            $table->dropIndex(['urutan']);
        });

        Schema::table('bank_soals', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['level_id']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['kompetensi_id', 'is_active', 'jenis']);
        });

        Schema::table('asesmens', function (Blueprint $table) {
            $table->dropIndex(['created_by']);
            $table->dropIndex(['level_id']);
            $table->dropIndex(['tanggal_mulai']);
            $table->dropIndex(['tanggal_selesai']);
        });

        Schema::table('pretest_results', function (Blueprint $table) {
            $table->dropIndex(['completed_at']);
            $table->dropIndex(['sesi_id']);
        });

        Schema::table('peserta_asesmens', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['lulus']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('jawaban_pesertas', function (Blueprint $table) {
            $table->dropIndex(['bank_soal_id']);
            $table->dropIndex(['dinilai_oleh']);
        });

        Schema::table('nilai_kompetensis', function (Blueprint $table) {
            $table->dropIndex(['kompetensi_id']);
            $table->dropIndex(['asesmen_id']);
        });

        Schema::table('walidatas', function (Blueprint $table) {
            $table->dropIndex(['nilai_kompetensi']);
            $table->dropIndex(['user_id']);
        });
    }
};
