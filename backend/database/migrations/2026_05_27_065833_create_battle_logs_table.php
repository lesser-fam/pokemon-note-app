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
        Schema::create('battle_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('party_version_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('result'); // win / lose

            $table->string('opponent_pokemon_1')->nullable();
            $table->string('opponent_form_1')->nullable();

            $table->string('opponent_pokemon_2')->nullable();
            $table->string('opponent_form_2')->nullable();

            $table->string('opponent_pokemon_3')->nullable();
            $table->string('opponent_form_3')->nullable();

            $table->string('opponent_pokemon_4')->nullable();
            $table->string('opponent_form_4')->nullable();

            $table->string('opponent_pokemon_5')->nullable();
            $table->string('opponent_form_5')->nullable();

            $table->string('opponent_pokemon_6')->nullable();
            $table->string('opponent_form_6')->nullable();

            $table->foreignId('selected_pokemon_1_id')
                ->nullable()
                ->constrained('party_pokemon')
                ->nullOnDelete();

            $table->foreignId('selected_pokemon_2_id')
                ->nullable()
                ->constrained('party_pokemon')
                ->nullOnDelete();

            $table->foreignId('selected_pokemon_3_id')
                ->nullable()
                ->constrained('party_pokemon')
                ->nullOnDelete();

            $table->string('heavy_opponent_key')->nullable();
            $table->string('heavy_opponent_form')->nullable();

            $table->foreignId('needed_pokemon_id')
                ->nullable()
                ->constrained('party_pokemon')
                ->nullOnDelete();

            $table->json('loss_tags')->nullable();

            $table->text('reflection')->nullable();
            $table->text('next_note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battle_logs');
    }
};
