<?php

namespace App\Services;

use App\Models\Ability;
use App\Models\Item;
use App\Models\Move;
use App\Models\Nature;

class PartyPokemonMasterDataResolver
{
    public function resolve(array $pokemon): array
    {
        $item = $this->findItem($pokemon['item_id'] ?? null);
        $ability = $this->findAbility($pokemon['ability_id'] ?? null);
        $nature = $this->findNature($pokemon['nature_id'] ?? null);

        $move1 = $this->findMove($pokemon['move_1_id'] ?? null);
        $move2 = $this->findMove($pokemon['move_2_id'] ?? null);
        $move3 = $this->findMove($pokemon['move_3_id'] ?? null);
        $move4 = $this->findMove($pokemon['move_4_id'] ?? null);

        return [
            ...$pokemon,

            'item_id' => $item?->id,
            'item' => $item?->name ?? $this->normalizeText($pokemon['item'] ?? null),

            'ability_id' => $ability?->id,
            'ability' => $ability?->name,

            'nature_id' => $nature?->id,
            'nature' => $nature?->name,

            'move_1_id' => $move1?->id,
            'move_1' => $move1?->name,
            'move_1_type' => $this->getMoveType($move1),

            'move_2_id' => $move2?->id,
            'move_2' => $move2?->name,
            'move_2_type' => $this->getMoveType($move2),

            'move_3_id' => $move3?->id,
            'move_3' => $move3?->name,
            'move_3_type' => $this->getMoveType($move3),

            'move_4_id' => $move4?->id,
            'move_4' => $move4?->name,
            'move_4_type' => $this->getMoveType($move4),
        ];
    }

    private function findItem(?int $itemId): ?Item
    {
        return $itemId ? Item::findOrFail($itemId) : null;
    }

    private function findAbility(?int $abilityId): ?Ability
    {
        return $abilityId ? Ability::findOrFail($abilityId) : null;
    }

    private function findNature(?int $natureId): ?Nature
    {
        return $natureId ? Nature::findOrFail($natureId) : null;
    }

    private function findMove(?int $moveId): ?Move
    {
        return $moveId ? Move::findOrFail($moveId) : null;
    }

    private function getMoveType(?Move $move): ?string
    {
        if (! $move || ! $move->is_scoring_target) {
            return null;
        }

        return $move->type;
    }

    private function normalizeText(?string $value): ?string
    {
        $normalizedValue = trim($value ?? '');

        return $normalizedValue !== '' ? $normalizedValue : null;
    }
}
