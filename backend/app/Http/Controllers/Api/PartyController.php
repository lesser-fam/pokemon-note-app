<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartyRequest;
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
            'versions',
        ]);

        return response()->json([
            'data' => $party,
        ]);
    }
}
