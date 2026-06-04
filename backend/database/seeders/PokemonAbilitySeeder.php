<?php

namespace Database\Seeders;

use App\Models\Ability;
use App\Models\PokemonAbility;
use Illuminate\Database\Seeder;
use RuntimeException;

class PokemonAbilitySeeder extends Seeder
{
    public function run(): void
    {
        $pokemonAbilities = [
            /*
            |--------------------------------------------------------------------------
            | タイプ無効・耐性特性
            |--------------------------------------------------------------------------
            */
            [
                'pokemon_key' => 'rotom-wash',
                'form_key' => 'default',
                'ability_key' => 'levitate',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'heatran',
                'form_key' => 'default',
                'ability_key' => 'flash-fire',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'gastrodon',
                'form_key' => 'default',
                'ability_key' => 'storm-drain',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'clodsire',
                'form_key' => 'default',
                'ability_key' => 'water-absorb',
                'is_hidden' => true,
            ],
            [
                'pokemon_key' => 'bronzong',
                'form_key' => 'default',
                'ability_key' => 'levitate',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'bronzong',
                'form_key' => 'default',
                'ability_key' => 'heatproof',
                'is_hidden' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | 登場時・特性無視
            |--------------------------------------------------------------------------
            */
            [
                'pokemon_key' => 'gyarados',
                'form_key' => 'default',
                'ability_key' => 'intimidate',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'excadrill',
                'form_key' => 'default',
                'ability_key' => 'mold-breaker',
                'is_hidden' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | 行動保証・ダメージ軽減
            |--------------------------------------------------------------------------
            */
            [
                'pokemon_key' => 'mimikyu',
                'form_key' => 'default',
                'ability_key' => 'disguise',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'dragonite',
                'form_key' => 'default',
                'ability_key' => 'multiscale',
                'is_hidden' => true,
            ],
            [
                'pokemon_key' => 'lunala',
                'form_key' => 'default',
                'ability_key' => 'shadow-shield',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'archaludon',
                'form_key' => 'default',
                'ability_key' => 'sturdy',
                'is_hidden' => true,
            ],
            [
                'pokemon_key' => 'necrozma',
                'form_key' => 'default',
                'ability_key' => 'prism-armor',
                'is_hidden' => false,
            ],

            /*
            |--------------------------------------------------------------------------
            | 能力変化・変化技への警戒
            |--------------------------------------------------------------------------
            */
            [
                'pokemon_key' => 'dondozo',
                'form_key' => 'default',
                'ability_key' => 'unaware',
                'is_hidden' => true,
            ],
            [
                'pokemon_key' => 'hatterene',
                'form_key' => 'default',
                'ability_key' => 'magic-bounce',
                'is_hidden' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | 災い系
            |--------------------------------------------------------------------------
            */
            [
                'pokemon_key' => 'wo-chien',
                'form_key' => 'default',
                'ability_key' => 'tablets-of-ruin',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'chien-pao',
                'form_key' => 'default',
                'ability_key' => 'sword-of-ruin',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'ting-lu',
                'form_key' => 'default',
                'ability_key' => 'vessel-of-ruin',
                'is_hidden' => false,
            ],
            [
                'pokemon_key' => 'chi-yu',
                'form_key' => 'default',
                'ability_key' => 'beads-of-ruin',
                'is_hidden' => false,
            ],
        ];

        foreach ($pokemonAbilities as $pokemonAbility) {
            $abilityId = $this->findAbilityId(
                $pokemonAbility['ability_key'],
            );

            PokemonAbility::updateOrCreate(
                [
                    'pokemon_key' => $pokemonAbility['pokemon_key'],
                    'form_key' => $pokemonAbility['form_key'],
                    'ability_id' => $abilityId,
                ],
                [
                    'is_hidden' => $pokemonAbility['is_hidden'],
                ],
            );
        }
    }

    private function findAbilityId(string $abilityKey): int
    {
        $ability = Ability::query()
            ->where('key', $abilityKey)
            ->first();

        if (! $ability) {
            throw new RuntimeException(
                "特性マスターが見つかりません: {$abilityKey}",
            );
        }

        return $ability->id;
    }
}
