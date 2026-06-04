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
        Schema::create('pokemon_abilities', function (Blueprint $table) {
            $table->id();

            $table->string('pokemon_key');
            $table->string('form_key')->default('default');

            $table->foreignId('ability_id')
                ->constrained('abilities')
                ->cascadeOnDelete();

            $table->boolean('is_hidden')->default(false);

            $table->unique(
                [
                    'pokemon_key',
                    'form_key',
                    'ability_id',
                ],
                'pokemon_abilities_unique',
            );

            $table->index(
                [
                    'pokemon_key',
                    'form_key',
                ],
                'pokemon_abilities_lookup',
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pokemon_abilities');
    }
};
