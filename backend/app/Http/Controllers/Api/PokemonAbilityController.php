<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PokemonAbility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PokemonAbilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pokemon' => [
                'required',
                'array',
                'min:1',
                'max:6',
            ],
            'pokemon.*' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $pokemonPairs = collect($validated['pokemon'])
            ->map(function (string $pokemon): array {
                [$pokemonKey, $formKey] = array_pad(
                    explode(':', $pokemon, 2),
                    2,
                    'default',
                );

                return [
                    'pokemon_key' => trim($pokemonKey),
                    'form_key' => trim($formKey) ?: 'default',
                ];
            })
            ->filter(
                fn(array $pokemon): bool =>
                $pokemon['pokemon_key'] !== '',
            )
            ->unique(
                fn(array $pokemon): string =>
                "{$pokemon['pokemon_key']}:{$pokemon['form_key']}",
            )
            ->values();

        $pokemonAbilities = PokemonAbility::query()
            ->with([
                'ability.effectRules',
            ])
            ->where(function ($query) use ($pokemonPairs) {
                foreach ($pokemonPairs as $pokemon) {
                    $query->orWhere(function ($query) use ($pokemon) {
                        $query
                            ->where(
                                'pokemon_key',
                                $pokemon['pokemon_key'],
                            )
                            ->where(
                                'form_key',
                                $pokemon['form_key'],
                            );
                    });
                }
            })
            ->get();

        $data = $pokemonPairs->map(function (
            array $pokemon,
        ) use ($pokemonAbilities): array {
            $abilities = $pokemonAbilities
                ->where(
                    'pokemon_key',
                    $pokemon['pokemon_key'],
                )
                ->where(
                    'form_key',
                    $pokemon['form_key'],
                )
                ->map(function (PokemonAbility $pokemonAbility): array {
                    return [
                        'id' => $pokemonAbility->ability->id,
                        'key' => $pokemonAbility->ability->key,
                        'name' => $pokemonAbility->ability->name,
                        'description' => $pokemonAbility->ability->description,
                        'is_hidden' => $pokemonAbility->is_hidden,
                        'effect_rules' =>
                        $pokemonAbility
                            ->ability
                            ->effectRules
                            ->map(function ($rule): array {
                                return [
                                    'id' => $rule->id,
                                    'key' => $rule->key,
                                    'effect_type' =>
                                    $rule->effect_type,
                                    'target_type' =>
                                    $rule->target_type,
                                    'value' => $rule->value,
                                    'condition' =>
                                    $rule->condition,
                                    'description' =>
                                    $rule->description,
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values();

            return [
                'pokemon_key' => $pokemon['pokemon_key'],
                'form_key' => $pokemon['form_key'],
                'abilities' => $abilities,
            ];
        });

        return response()->json([
            'data' => $data,
        ]);
    }
}
