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
        Schema::create('battle_regulation_abilities', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('battle_regulation_id')
                ->constrained()
                ->cascadeOnDelete();

            $table
                ->foreignId('ability_id')
                ->constrained()
                ->cascadeOnDelete();


            $table->unique(
                [
                    'battle_regulation_id',
                    'ability_id',
                ],
                'regulation_ability_unique',
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('battle_regulation_abilities');
    }
};
