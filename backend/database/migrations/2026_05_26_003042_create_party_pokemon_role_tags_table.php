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
        Schema::create('party_pokemon_role_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_pokemon_id')->constrained('party_pokemon')->cascadeOnDelete();
            $table->foreignId('role_tag_id')->constrained()->cascadeOnDelete();
            $table->unique(['party_pokemon_id', 'role_tag_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('party_pokemon_role_tags');
    }
};
