<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pokemon_common_moves', function (Blueprint $table) {
            $table->string('rule')->default('main_series')->after('id');
            $table->dropUnique(['pokemon_key', 'form_key', 'move_id']);
            $table->unique(['rule', 'pokemon_key', 'form_key', 'move_id'], 'pokemon_common_moves_rule_pokemon_form_move_unique');
            $table->index(['rule', 'pokemon_key', 'form_key'], 'pokemon_common_moves_rule_pokemon_form_index');
        });
    }

    public function down(): void
    {
        Schema::table('pokemon_common_moves', function (Blueprint $table) {
            $table->dropUnique('pokemon_common_moves_rule_pokemon_form_move_unique');
            $table->dropIndex('pokemon_common_moves_rule_pokemon_form_index');
            $table->unique(['pokemon_key', 'form_key', 'move_id']);
            $table->dropColumn('rule');
        });
    }
};
