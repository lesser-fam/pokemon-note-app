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
        Schema::table('battle_logs', function (Blueprint $table) {
            $table->string('selected_opponent_pokemon_1')->nullable();
            $table->string('selected_opponent_form_1')->nullable();

            $table->string('selected_opponent_pokemon_2')->nullable();
            $table->string('selected_opponent_form_2')->nullable();

            $table->string('selected_opponent_pokemon_3')->nullable();
            $table->string('selected_opponent_form_3')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('battle_logs', function (Blueprint $table) {
            $table->dropColumn([
                'selected_opponent_pokemon_1',
                'selected_opponent_form_1',
                'selected_opponent_pokemon_2',
                'selected_opponent_form_2',
                'selected_opponent_pokemon_3',
                'selected_opponent_form_3',
            ]);
        });
    }
};
