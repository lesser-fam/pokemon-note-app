<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewPartyVersionRequest;
use App\Models\PartyVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PartyVersionController extends Controller
{
    public function storeNewVersion(
        StoreNewPartyVersionRequest $request,
        PartyVersion $partyVersion
    ): JsonResponse {
        if ($partyVersion->party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $newPartyVersion = DB::transaction(function () use ($partyVersion, $validated) {
            $party = $partyVersion->party;

            $nextVersionNumber = $party->versions()->max('version_number') + 1;

            $party->versions()->update([
                'is_current' => false,
            ]);

            $newPartyVersion = $party->versions()->create([
                'version_number' => $nextVersionNumber,
                'change_note' => $validated['change_note'] ?? null,
                'is_current' => true,
            ]);

            foreach ($validated['pokemon'] as $pokemonData) {
                $roleTagIds = $pokemonData['role_tag_ids'] ?? [];

                unset($pokemonData['role_tag_ids']);

                $partyPokemon = $newPartyVersion->pokemon()->create($pokemonData);

                if (! empty($roleTagIds)) {
                    $partyPokemon->roleTags()->sync($roleTagIds);
                }
            }

            return $newPartyVersion;
        });

        $newPartyVersion->load([
            'pokemon.roleTags',
        ]);

        return response()->json([
            'message' => '新しいパーティバージョンを作成しました。',
            'data' => $newPartyVersion,
        ], 201);
    }
}
