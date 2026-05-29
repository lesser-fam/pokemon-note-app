<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSelectionTemplateRequest;
use App\Http\Requests\UpdateSelectionTemplateRequest;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use App\Models\SelectionTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function update(
        UpdateSelectionTemplateRequest $request,
        SelectionTemplate $selectionTemplate
    ): JsonResponse {
        $partyVersion = $selectionTemplate->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $pokemonIds = [
            $validated['lead_pokemon_id'],
            $validated['switch_pokemon_id'],
            $validated['finisher_pokemon_id'],
        ];

        $validPokemonCount = PartyPokemon::query()
            ->where('party_version_id', $partyVersion->id)
            ->whereIn('id', $pokemonIds)
            ->count();

        if ($validPokemonCount !== 3) {
            return response()->json([
                'message' => '同じパーティバージョンのポケモンを選択してください。',
            ], 422);
        }

        if (count(array_unique($pokemonIds)) !== 3) {
            return response()->json([
                'message' => '同じポケモンを複数の枠に選択することはできません。',
            ], 422);
        }

        $selectionTemplate->update([
            'name'                  => $validated['name'],
            'lead_pokemon_id'       => $validated['lead_pokemon_id'],
            'switch_pokemon_id'     => $validated['switch_pokemon_id'],
            'finisher_pokemon_id'   => $validated['finisher_pokemon_id'],
            'memo'                  => $validated['memo'] ?? null,
        ]);

        $selectionTemplate->load([
            'leadPokemon.roleTags',
            'switchPokemon.roleTags',
            'finisherPokemon.roleTags',
        ]);

        return response()->json([
            'message' => '基本選出を更新しました。',
            'data' => $selectionTemplate,
        ]);
    }

    public function destroy(Request $request, SelectionTemplate $selectionTemplate): JsonResponse
    {
        $partyVersion = $selectionTemplate->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $selectionTemplate->delete();

        return response()->json([
            'message' => '基本選出を削除しました。',
        ]);
    }
}
