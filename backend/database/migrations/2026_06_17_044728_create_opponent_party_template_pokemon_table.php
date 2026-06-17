<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'opponent_party_template_pokemon',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('opponent_party_template_id');

                $table->string('pokemon_key');
                $table->string('form_key')->default('default');
                $table->unsignedTinyInteger('display_order');
                $table->timestamps();

                $table
                    ->foreign(
                        'opponent_party_template_id',
                        'optp_template_fk',
                    )
                    ->references('id')
                    ->on('opponent_party_templates')
                    ->cascadeOnDelete();

                $table->unique(
                    [
                        'opponent_party_template_id',
                        'pokemon_key',
                    ],
                    'optp_template_pokemon_unique',
                );

                $table->unique(
                    [
                        'opponent_party_template_id',
                        'display_order',
                    ],
                    'optp_template_order_unique',
                );

                $table->index(
                    [
                        'pokemon_key',
                        'form_key',
                    ],
                    'optp_pokemon_form_index',
                );
            },
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('opponent_party_template_pokemon');
    }
};
