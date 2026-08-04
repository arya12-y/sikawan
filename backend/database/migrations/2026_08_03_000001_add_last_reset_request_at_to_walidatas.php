<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('walidatas', function (Blueprint $table): void {
            $table->timestamp('last_reset_request_at')->nullable()->after('pretest_activated');
        });
    }

    public function down(): void
    {
        Schema::table('walidatas', function (Blueprint $table): void {
            $table->dropColumn('last_reset_request_at');
        });
    }
};
