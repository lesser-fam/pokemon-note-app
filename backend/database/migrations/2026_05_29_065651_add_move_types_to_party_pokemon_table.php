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
        Schema::table('party_pokemon', function (Blueprint $table) {
            $table->string('move_1_type')->nullable()->after('move_1');
            $table->string('move_2_type')->nullable()->after('move_2');
            $table->string('move_3_type')->nullable()->after('move_3');
            $table->string('move_4_type')->nullable()->after('move_4');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_pokemon', function (Blueprint $table) {
            $table->dropColumn([
                'move_1_type',
                'move_2_type',
                'move_3_type',
                'move_4_type',
            ]);
        });
    }
};
