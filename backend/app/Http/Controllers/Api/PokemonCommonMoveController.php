<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PokemonCommonMoveResource;
use App\Models\PokemonCommonMove;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class PokemonCommonMoveController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $pokemonKey = $request->query('pokemon_key');
        $formKey = $request->query('form_key');

        $query = PokemonCommonMove::query()
            ->with('move')
            ->orderBy('usage_rank')
            ->orderBy('id');

        if ($pokemonKey) {
            $query->where('pokemon_key', $pokemonKey);
        }

        if ($formKey) {
            $query->where('form_key', $formKey);
        }

        return PokemonCommonMoveResource::collection($query->get());
    }

    public function store(Request $request): PokemonCommonMoveResource
    {
        $validated = $request->validate([
            'pokemon_key' => ['required', 'string', 'max:255'],
            'form_key' => ['required', 'string', 'max:255'],
            'move_id' => ['required', 'integer', 'exists:moves,id'],
            'usage_rank' => ['nullable', 'integer', 'min:1', 'max:99'],
            'memo' => ['nullable', 'string', 'max:255'],
        ]);

        $usageRank = $validated['usage_rank'] ?? null;

        if (!$usageRank) {
            $usageRank = PokemonCommonMove::query()
                ->where('pokemon_key', $validated['pokemon_key'])
                ->where('form_key', $validated['form_key'])
                ->max('usage_rank');

            $usageRank = $usageRank ? $usageRank + 1 : 1;
        }

        $commonMove = PokemonCommonMove::updateOrCreate(
            [
                'pokemon_key' => $validated['pokemon_key'],
                'form_key' => $validated['form_key'],
                'move_id' => $validated['move_id'],
            ],
            [
                'usage_rank' => $usageRank,
                'memo' => $validated['memo'] ?? null,
            ],
        );

        return new PokemonCommonMoveResource($commonMove->load('move'));
    }

    public function destroy(PokemonCommonMove $pokemonCommonMove): Response
    {
        $pokemonCommonMove->delete();

        return response()->noContent();
    }
}
