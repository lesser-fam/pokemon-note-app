<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyRequest;
use App\Http\Requests\UpdatePartyRequest;
use App\Models\Party;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $parties = Party::query()
            ->where('user_id', $request->user()->id)
            ->with('currentVersion')
            ->latest()
            ->get();

        return response()->json([
            'data' => $parties,
        ]);
    }

    public function store(StorePartyRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $party = DB::transaction(function () use ($request, $validated) {
            $party = Party::create([
                'user_id' => $request->user()->id,
                'name'    => $validated['name'],
                'rule'    => $validated['rule'] ?? 'main_series',
                'concept' => $validated['concept'] ?? null,
                'memo'    => $validated['memo'] ?? null,
            ]);

            $party->versions()->create([
                'version_number' => 1,
                'change_note' => '初期バージョン',
                'is_current' => true,
            ]);

            return $party;
        });

        $party->load('currentVersion');

        return response()->json([
            'message' => 'パーティを作成しました。',
            'data' => $party,
        ], 201);
    }

    public function show(Request $request, Party $party): JsonResponse
    {
        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $party->load([
            'currentVersion.pokemon.roleTags',

            'currentVersion.pokemon.itemMaster.effectRules',
            'currentVersion.pokemon.abilityMaster.effectRules',
            'currentVersion.pokemon.natureMaster',
            'currentVersion.pokemon.move1Master',
            'currentVersion.pokemon.move2Master',
            'currentVersion.pokemon.move3Master',
            'currentVersion.pokemon.move4Master',

            'currentVersion.selectionTemplates.leadPokemon.roleTags',
            'currentVersion.selectionTemplates.switchPokemon.roleTags',
            'currentVersion.selectionTemplates.finisherPokemon.roleTags',
            'currentVersion.battleLogs.selectedPokemon1.roleTags',
            'currentVersion.battleLogs.selectedPokemon2.roleTags',
            'currentVersion.battleLogs.selectedPokemon3.roleTags',
            'currentVersion.battleLogs.neededPokemon.roleTags',
            'versions',
        ]);

        return response()->json([
            'data' => $party,
        ]);
    }

    public function update(UpdatePartyRequest $request, Party $party): JsonResponse
    {
        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validated();

        $party->update([
            'name' => $validated['name'],
            'rule' => $validated['rule'],
            'concept' => $validated['concept'] ?? null,
            'memo' => $validated['memo'] ?? null,
        ]);

        $party->load('currentVersion');

        return response()->json([
            'message' => 'パーティを更新しました。',
            'data' => $party,
        ]);
    }

    public function destroy(Request $request, Party $party): JsonResponse
    {
        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $party->delete();

        return response()->json([
            'message' => 'パーティを削除しました。',
        ]);
    }
}
