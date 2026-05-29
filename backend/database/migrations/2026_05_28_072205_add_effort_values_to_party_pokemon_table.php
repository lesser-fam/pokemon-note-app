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
            $table->unsignedSmallInteger('ev_h')->default(0)->after('nature');
            $table->unsignedSmallInteger('ev_a')->default(0)->after('ev_h');
            $table->unsignedSmallInteger('ev_b')->default(0)->after('ev_a');
            $table->unsignedSmallInteger('ev_c')->default(0)->after('ev_b');
            $table->unsignedSmallInteger('ev_d')->default(0)->after('ev_c');
            $table->unsignedSmallInteger('ev_s')->default(0)->after('ev_d');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_pokemon', function (Blueprint $table) {
            $table->dropColumn([
                'ev_h',
                'ev_a',
                'ev_b',
                'ev_c',
                'ev_d',
                'ev_s',
            ]);
        });
    }
};
