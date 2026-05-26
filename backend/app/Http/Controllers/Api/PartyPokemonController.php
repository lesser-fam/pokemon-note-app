<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyPokemonRequest;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use Illuminate\Http\JsonResponse;
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
}
