<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE bank_soals MODIFY tipe JSON NULL');

        DB::table('bank_soals')->whereNotNull('tipe')->where('tipe', '!=', 'null')->update([
            'tipe' => DB::raw('JSON_ARRAY(tipe)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('bank_soals', function (Blueprint $table) {
            $table->string('tipe', 20)->nullable()->change();
        });
    }
};
