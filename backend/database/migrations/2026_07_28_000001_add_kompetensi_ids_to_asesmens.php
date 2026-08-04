<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asesmens', function (Blueprint $table) {
            $table->json('kompetensi_ids')->nullable()->after('kompetensi_id');
        });

        DB::table('asesmens')->orderBy('id')->chunk(100, function ($asesmens) {
            foreach ($asesmens as $asesmen) {
                if ($asesmen->kompetensi_id) {
                    DB::table('asesmens')
                        ->where('id', $asesmen->id)
                        ->update(['kompetensi_ids' => json_encode([$asesmen->kompetensi_id])]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('asesmens', function (Blueprint $table) {
            $table->dropColumn('kompetensi_ids');
        });
    }
};