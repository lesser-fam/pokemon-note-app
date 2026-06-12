<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBattleLogRequest;
use App\Models\BattleLog;
use App\Models\PartyVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BattleLogController extends Controller
{
    public function store(
        StoreBattleLogRequest $request,
        PartyVersion $partyVersion
    ): JsonResponse {
        if ($partyVersion->party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $selectedPokemonIds = collect([
            $validated['selected_pokemon_1_id'] ?? null,
            $validated['selected_pokemon_2_id'] ?? null,
            $validated['selected_pokemon_3_id'] ?? null,
            $validated['needed_pokemon_id'] ?? null,
        ])
            ->filter()
            ->unique()
            ->values();

        if ($selectedPokemonIds->isNotEmpty()) {
            $ownedPokemonCount = $partyVersion->pokemon()
                ->whereIn('id', $selectedPokemonIds)
                ->count();

            if ($ownedPokemonCount !== $selectedPokemonIds->count()) {
                return response()->json([
                    'message' => '選択された味方ポケモンが、このパーティバージョンに存在しません。',
                ], 422);
            }
        }

        $battleLog = $partyVersion->battleLogs()->create($validated);

        $battleLog->load([
            'selectedPokemon1.roleTags',
            'selectedPokemon2.roleTags',
            'selectedPokemon3.roleTags',
            'neededPokemon.roleTags',
        ]);

        return response()->json([
            'message' => '対戦ログを保存しました。',
            'data' => $battleLog,
        ], 201);
    }

    public function destroy(Request $request, BattleLog $battleLog): JsonResponse
    {
        $partyVersion = $battleLog->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $battleLog->delete();

        return response()->json([
            'message' => '対戦ログを削除しました。'
        ]);
    }
}
