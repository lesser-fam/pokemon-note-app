<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('opponent_party_templates', function (Blueprint $table) {
            $table
                ->string('rule')
                ->default('main_series')
                ->after('id')
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('opponent_party_templates', function (Blueprint $table) {
            $table->dropIndex(['rule']);

            $table->dropColumn(('rule'));
        });
    }
};
