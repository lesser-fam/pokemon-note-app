<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DuplicatePartyRequest;
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

            'versions.pokemon.roleTags',
            'versions.pokemon.itemMaster.effectRules',
            'versions.pokemon.abilityMaster.effectRules',
            'versions.pokemon.natureMaster',
            'versions.battleLogs.selectedPokemon1.roleTags',
            'versions.battleLogs.selectedPokemon2.roleTags',
            'versions.battleLogs.selectedPokemon3.roleTags',
            'versions.battleLogs.neededPokemon.roleTags',
        ]);

        return response()->json([
            'data' => $party,
        ]);
    }

    public function duplicate(
        DuplicatePartyRequest $request,
        Party $party,
    ): JsonResponse {
        if ($party->user_id !== $request->user()->id) {
            abort(404);
        }

        $party->load('currentVersion.pokemon.roleTags');

        $sourceVersion = $party->currentVersion;

        if (! $sourceVersion || $sourceVersion->pokemon->count() !== 6) {
            return response()->json([
                'message' => 'パーティを複製するには、現在のバージョンにポケモンを6匹登録してください。',
            ], 422);
        }

        $validated = $request->validated();

        $duplicatedParty = DB::transaction(function () use ($request, $party, $sourceVersion, $validated) {
            $newParty = Party::create([
                'user_id' => $request->user()->id,
                'name' => $validated['name'],
                'rule' => $party->rule,
                'concept' => $validated['concept'] ?? null,
                'memo' => $validated['memo'] ?? null,
            ]);

            $newVersion = $newParty->versions()->create([
                'version_number' => 1,
                'change_note' => '初期バージョン',
                'is_current' => true,
            ]);

            foreach ($sourceVersion->pokemon as $sourcePokemon) {
                $newPokemon = $newVersion->pokemon()->create([
                    'pokemon_key' => $sourcePokemon->pokemon_key,
                    'form_key' => $sourcePokemon->form_key,
                    'nickname' => $sourcePokemon->nickname,
                    'item' => $sourcePokemon->item,
                    'item_id' => $sourcePokemon->item_id,
                    'ability' => $sourcePokemon->ability,
                    'ability_id' => $sourcePokemon->ability_id,
                    'nature' => $sourcePokemon->nature,
                    'nature_id' => $sourcePokemon->nature_id,
                    'ev_h' => $sourcePokemon->ev_h,
                    'ev_a' => $sourcePokemon->ev_a,
                    'ev_b' => $sourcePokemon->ev_b,
                    'ev_c' => $sourcePokemon->ev_c,
                    'ev_d' => $sourcePokemon->ev_d,
                    'ev_s' => $sourcePokemon->ev_s,
                    'move_1' => $sourcePokemon->move_1,
                    'move_1_id' => $sourcePokemon->move_1_id,
                    'move_1_type' => $sourcePokemon->move_1_type,
                    'move_2' => $sourcePokemon->move_2,
                    'move_2_id' => $sourcePokemon->move_2_id,
                    'move_2_type' => $sourcePokemon->move_2_type,
                    'move_3' => $sourcePokemon->move_3,
                    'move_3_id' => $sourcePokemon->move_3_id,
                    'move_3_type' => $sourcePokemon->move_3_type,
                    'move_4' => $sourcePokemon->move_4,
                    'move_4_id' => $sourcePokemon->move_4_id,
                    'move_4_type' => $sourcePokemon->move_4_type,
                    'memo' => $sourcePokemon->memo,
                ]);

                $newPokemon->roleTags()->sync($sourcePokemon->roleTags->modelKeys());
            }

            return $newParty;
        });

        $duplicatedParty->load('currentVersion.pokemon.roleTags');

        return response()->json([
            'message' => 'パーティを複製しました。',
            'data' => $duplicatedParty,
        ], 201);
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
