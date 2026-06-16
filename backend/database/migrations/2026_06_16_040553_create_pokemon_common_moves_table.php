<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pokemon_common_moves', function (Blueprint $table) {
            $table->id();
            $table->string('pokemon_key');
            $table->string('form_key')->default('default');
            $table->foreignId('move_id')->constrained('moves')->cascadeOnDelete();
            $table->unsignedTinyInteger('usage_rank')->default(1);
            $table->string('memo')->nullable();

            $table->unique(['pokemon_key', 'form_key', 'move_id']);
            $table->index(['pokemon_key', 'form_key']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pokemon_common_moves');
    }
};
