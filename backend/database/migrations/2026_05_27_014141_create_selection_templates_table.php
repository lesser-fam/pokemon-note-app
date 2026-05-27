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
        Schema::create('selection_templates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('party_version_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->foreignId('lead_pokemon_id')
                ->constrained('party_pokemon')
                ->cascadeOnDelete();

            $table->foreignId('switch_pokemon_id')
                ->constrained('party_pokemon')
                ->cascadeOnDelete();

            $table->foreignId('finisher_pokemon_id')
                ->constrained('party_pokemon')
                ->cascadeOnDelete();

            $table->text('memo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('selection_templates');
    }
};
