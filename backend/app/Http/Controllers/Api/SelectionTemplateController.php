<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSelectionTemplateRequest;
use App\Models\PartyVersion;
use Illuminate\Http\JsonResponse;

class SelectionTemplateController extends Controller
{
    public function store(
        StoreSelectionTemplateRequest $request,
        PartyVersion $partyVersion
    ): JsonResponse {
        if ($partyVersion->party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $pokemonIds = [
            $validated['lead_pokemon_id'],
            $validated['switch_pokemon_id'],
            $validated['finisher_pokemon_id'],
        ];

        $ownedPokemonCount = $partyVersion->pokemon()
            ->whereIn('id', $pokemonIds)
            ->count();

        if ($ownedPokemonCount !== 3) {
            return response()->json([
                'message' => '選択されたポケモンが、このパーティバージョンに存在しません。',
            ], 422);
        }

        $selectionTemplate = $partyVersion->selectionTemplates()->create([
            'name' => $validated['name'],
            'lead_pokemon_id' => $validated['lead_pokemon_id'],
            'switch_pokemon_id' => $validated['switch_pokemon_id'],
            'finisher_pokemon_id' => $validated['finisher_pokemon_id'],
            'memo' => $validated['memo'] ?? null,
        ]);

        $selectionTemplate->load([
            'leadPokemon.roleTags',
            'switchPokemon.roleTags',
            'finisherPokemon.roleTags',
        ]);

        return response()->json([
            'message' => '基本選出を保存しました。',
            'data' => $selectionTemplate,
        ], 201);
    }
}
