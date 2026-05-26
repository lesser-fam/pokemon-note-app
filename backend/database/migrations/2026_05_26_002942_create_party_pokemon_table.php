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
        Schema::create('party_pokemon', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_version_id')->constrained()->cascadeOnDelete();

            $table->string('pokemon_key');
            $table->string('form_key')->default('default');

            $table->string('nickname')->nullable();
            $table->string('item')->nullable();
            $table->string('ability')->nullable();
            $table->string('nature')->nullable();

            $table->string('move_1')->nullable();
            $table->string('move_2')->nullable();
            $table->string('move_3')->nullable();
            $table->string('move_4')->nullable();

            $table->text('memo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('party_pokemon');
    }
};
