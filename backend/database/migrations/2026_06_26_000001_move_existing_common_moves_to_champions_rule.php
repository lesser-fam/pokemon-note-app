<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $duplicateMainMoveIds = DB::table('pokemon_common_moves as main_moves')
                ->join('pokemon_common_moves as champion_moves', function ($join): void {
                    $join
                        ->on('champion_moves.pokemon_key', '=', 'main_moves.pokemon_key')
                        ->on('champion_moves.form_key', '=', 'main_moves.form_key')
                        ->on('champion_moves.move_id', '=', 'main_moves.move_id')
                        ->where('champion_moves.rule', '=', 'champions');
                })
                ->where('main_moves.rule', 'main_series')
                ->pluck('main_moves.id');

            if ($duplicateMainMoveIds->isNotEmpty()) {
                DB::table('pokemon_common_moves')
                    ->whereIn('id', $duplicateMainMoveIds)
                    ->delete();
            }

            DB::table('pokemon_common_moves')
                ->where('rule', 'main_series')
                ->update(['rule' => 'champions']);
        });
    }

    public function down(): void
    {
        DB::transaction(function (): void {
            $duplicateChampionMoveIds = DB::table('pokemon_common_moves as champion_moves')
                ->join('pokemon_common_moves as main_moves', function ($join): void {
                    $join
                        ->on('main_moves.pokemon_key', '=', 'champion_moves.pokemon_key')
                        ->on('main_moves.form_key', '=', 'champion_moves.form_key')
                        ->on('main_moves.move_id', '=', 'champion_moves.move_id')
                        ->where('main_moves.rule', '=', 'main_series');
                })
                ->where('champion_moves.rule', 'champions')
                ->pluck('champion_moves.id');

            if ($duplicateChampionMoveIds->isNotEmpty()) {
                DB::table('pokemon_common_moves')
                    ->whereIn('id', $duplicateChampionMoveIds)
                    ->delete();
            }

            DB::table('pokemon_common_moves')
                ->where('rule', 'champions')
                ->update(['rule' => 'main_series']);
        });
    }
};