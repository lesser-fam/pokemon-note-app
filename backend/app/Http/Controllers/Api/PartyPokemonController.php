<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyPokemonRequest;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartyPokemonController extends Controller
{
    public function store(
        StorePartyPokemonRequest $request,
        PartyVersion $partyVersion
    ): JsonResponse {
        if ($partyVersion->party->user_id !== $request->user()->id) {
            abort(404);
        }

        if ($partyVersion->pokemon()->count() >= 6) {
            return response()->json([
                'message' => 'ポケモンは6匹まで登録できます。',
            ], 422);
        }

        $validated = $request->validated();

        $partyPokemon = DB::transaction(function () use ($partyVersion, $validated) {
            $roleTagIds = $validated['role_tag_ids'] ?? [];

            unset($validated['role_tag_ids']);

            $partyPokemon = $partyVersion->pokemon()->create($validated);

            if (! empty($roleTagIds)) {
                $partyPokemon->roleTags()->sync($roleTagIds);
            }

            return $partyPokemon;
        });

        $partyPokemon->load('roleTags');

        return response()->json([
            'message' => 'ポケモンを登録しました。',
            'data' => $partyPokemon,
        ], 201);
    }

    public function destroy(
        Request $request,
        PartyPokemon $partyPokemon
    ): JsonResponse {
        $partyVersion = $partyPokemon->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $pokemonCount = $partyVersion->pokemon()->count();
        $hasSelectionTemplates = $partyVersion->selectionTemplates()->exists();
        $hasBattleLogs = $partyVersion->battleLogs()->exists();

        $canRemovePokemon =
            $partyVersion->is_current &&
            $partyVersion->version_number === 1 &&
            $pokemonCount < 6 &&
            ! $hasSelectionTemplates &&
            ! $hasBattleLogs;

        if (! $canRemovePokemon) {
            return response()->json([
                'message' => 'このポケモンは直接削除できません。構築を変更する場合は、新バージョンを作成してください。',
            ], 422);
        }

        $partyPokemon->delete();

        return response()->json([
            'message' => 'ポケモンを外しました。',
        ]);
    }
}
