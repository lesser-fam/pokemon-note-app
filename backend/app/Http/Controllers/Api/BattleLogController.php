<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBattleLogRequest;
use App\Http\Requests\UpdateBattleLogRequest;
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

        $validationErrorResponse = $this->validateBattleLogPayload(
            $partyVersion,
            $validated,
        );

        if ($validationErrorResponse) {
            return $validationErrorResponse;
        }

        $battleLog = $partyVersion->battleLogs()->create($validated);

        $this->loadRelations($battleLog);

        return response()->json([
            'message' => '対戦ログを保存しました。',
            'data' => $battleLog,
        ], 201);
    }

    public function update(
        UpdateBattleLogRequest $request,
        BattleLog $battleLog
    ): JsonResponse {
        $partyVersion = $battleLog->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $validationErrorResponse = $this->validateBattleLogPayload(
            $partyVersion,
            $validated,
        );

        if ($validationErrorResponse) {
            return $validationErrorResponse;
        }

        $battleLog->update($validated);

        $this->loadRelations($battleLog);

        return response()->json([
            'message' => '対戦ログを更新しました。',
            'data' => $battleLog,
        ]);
    }

    public function destroy(
        Request $request,
        BattleLog $battleLog
    ): JsonResponse {
        $partyVersion = $battleLog->partyVersion;
        $party = $partyVersion->party;

        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $battleLog->delete();

        return response()->json([
            'message' => '対戦ログを削除しました。',
        ]);
    }

    private function validateBattleLogPayload(
        PartyVersion $partyVersion,
        array $validated,
    ): ?JsonResponse {
        $selectedPokemonIds = collect([
            $validated['selected_pokemon_1_id'] ?? null,
            $validated['selected_pokemon_2_id'] ?? null,
            $validated['selected_pokemon_3_id'] ?? null,
        ])
            ->filter()
            ->values();

        if ($selectedPokemonIds->unique()->count() !== $selectedPokemonIds->count()) {
            return response()->json([
                'message' => '同じ味方ポケモンを複数の選出枠へ登録することはできません。',
            ], 422);
        }

        $ownedPokemonIds = $selectedPokemonIds
            ->push($validated['needed_pokemon_id'] ?? null)
            ->filter()
            ->unique()
            ->values();

        if ($ownedPokemonIds->isNotEmpty()) {
            $ownedPokemonCount = $partyVersion->pokemon()
                ->whereIn('id', $ownedPokemonIds)
                ->count();

            if ($ownedPokemonCount !== $ownedPokemonIds->count()) {
                return response()->json([
                    'message' => '選択された味方ポケモンが、このパーティバージョンに存在しません。',
                ], 422);
            }
        }

        $opponentPokemonKeys = collect([
            [
                'key' => $validated['opponent_pokemon_1'] ?? null,
                'form' => $validated['opponent_form_1'] ?? null,
            ],
            [
                'key' => $validated['opponent_pokemon_2'] ?? null,
                'form' => $validated['opponent_form_2'] ?? null,
            ],
            [
                'key' => $validated['opponent_pokemon_3'] ?? null,
                'form' => $validated['opponent_form_3'] ?? null,
            ],
            [
                'key' => $validated['opponent_pokemon_4'] ?? null,
                'form' => $validated['opponent_form_4'] ?? null,
            ],
            [
                'key' => $validated['opponent_pokemon_5'] ?? null,
                'form' => $validated['opponent_form_5'] ?? null,
            ],
            [
                'key' => $validated['opponent_pokemon_6'] ?? null,
                'form' => $validated['opponent_form_6'] ?? null,
            ],
        ])
            ->filter(fn(array $pokemon): bool => ! empty($pokemon['key']))
            ->map(
                fn(array $pokemon): string =>
                $this->createOpponentPokemonKey(
                    $pokemon['key'],
                    $pokemon['form'],
                ),
            );

        $selectedOpponentPokemonKeys = collect([
            [
                'key' => $validated['selected_opponent_pokemon_1'] ?? null,
                'form' => $validated['selected_opponent_form_1'] ?? null,
            ],
            [
                'key' => $validated['selected_opponent_pokemon_2'] ?? null,
                'form' => $validated['selected_opponent_form_2'] ?? null,
            ],
            [
                'key' => $validated['selected_opponent_pokemon_3'] ?? null,
                'form' => $validated['selected_opponent_form_3'] ?? null,
            ],
        ])
            ->filter(fn(array $pokemon): bool => ! empty($pokemon['key']))
            ->map(
                fn(array $pokemon): string =>
                $this->createOpponentPokemonKey(
                    $pokemon['key'],
                    $pokemon['form'],
                ),
            );

        if (
            $selectedOpponentPokemonKeys->unique()->count() !==
            $selectedOpponentPokemonKeys->count()
        ) {
            return response()->json([
                'message' => '同じ相手ポケモンを複数の選出枠へ登録することはできません。',
            ], 422);
        }

        if (
            $selectedOpponentPokemonKeys
            ->diff($opponentPokemonKeys)
            ->isNotEmpty()
        ) {
            return response()->json([
                'message' => '相手の選出には、相手パーティに登録されたポケモンを選んでください。',
            ], 422);
        }

        return null;
    }

    private function createOpponentPokemonKey(
        string $pokemonKey,
        ?string $formKey,
    ): string {
        return "{$pokemonKey}:" . ($formKey ?: 'default');
    }

    private function loadRelations(BattleLog $battleLog): void
    {
        $battleLog->load([
            'selectedPokemon1.roleTags',
            'selectedPokemon2.roleTags',
            'selectedPokemon3.roleTags',
            'neededPokemon.roleTags',
        ]);
    }
}
