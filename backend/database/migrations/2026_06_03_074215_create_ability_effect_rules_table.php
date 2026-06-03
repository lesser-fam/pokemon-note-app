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
        Schema::create('ability_effect_rules', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('ability_id')
                ->constrained('abilities')
                ->cascadeOnDelete();

            $table->string('key')->unique();

            $table->string('effect_type');

            $table->string('target_type')->nullable();

            $table->decimal('value', 6, 3)->nullable();

            $table->string('condition')->nullable();

            $table->text('description')->nullable();

            $table->index(
                [
                    'ability_id',
                    'effect_type',
                ],
                'ability_effect_lookup',
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ability_effect_rules');
    }
};
