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
        Schema::table('party_pokemon', function (Blueprint $table) {
            $table
                ->foreignId('item_id')
                ->nullable()
                ->after('item')
                ->constrained('items')
                ->nullOnDelete();

            $table
                ->foreignId('ability_id')
                ->nullable()
                ->after('ability')
                ->constrained('abilities')
                ->nullOnDelete();

            $table
                ->foreignId('nature_id')
                ->nullable()
                ->after('nature')
                ->constrained('natures')
                ->nullOnDelete();

            $table
                ->foreignId('move_1_id')
                ->nullable()
                ->after('move_1')
                ->constrained('moves')
                ->nullOnDelete();

            $table
                ->foreignId('move_2_id')
                ->nullable()
                ->after('move_2')
                ->constrained('moves')
                ->nullOnDelete();

            $table
                ->foreignId('move_3_id')
                ->nullable()
                ->after('move_3')
                ->constrained('moves')
                ->nullOnDelete();

            $table
                ->foreignId('move_4_id')
                ->nullable()
                ->after('move_4')
                ->constrained('moves')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_pokemon', function (Blueprint $table) {
            $table->dropConstrainedForeignId('move_4_id');
            $table->dropConstrainedForeignId('move_3_id');
            $table->dropConstrainedForeignId('move_2_id');
            $table->dropConstrainedForeignId('move_1_id');
            $table->dropConstrainedForeignId('nature_id');
            $table->dropConstrainedForeignId('ability_id');
            $table->dropConstrainedForeignId('item_id');
        });
    }
};
