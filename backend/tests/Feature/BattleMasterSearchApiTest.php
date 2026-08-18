<?php

namespace Tests\Feature;

use App\Models\Ability;
use App\Models\Item;
use App\Models\PokemonAbility;
use App\Models\Move;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BattleMasterSearchApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_moves_can_be_searched_with_hiragana_keyword(): void
    {
        Move::create([
            'key' => 'hyper-beam',
            'name' => 'ハカイコウセン',
            'type' => 'ノーマル',
            'damage_class' => 'special',
            'power' => 150,
        ]);

        $this->getJson('/api/moves?search=はかいこうせん')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'ハカイコウセン');
    }

    public function test_all_moves_can_be_fetched_without_the_default_limit(): void
    {
        foreach (range(1, 101) as $index) {
            Move::create([
                'key' => "move-{$index}",
                'name' => "技{$index}",
                'type' => 'ノーマル',
                'damage_class' => 'physical',
                'power' => 40,
            ]);
        }

        $this->getJson('/api/moves?all=true')
            ->assertOk()
            ->assertJsonCount(101, 'data');
    }

    public function test_items_can_be_searched_with_hiragana_keyword(): void
    {
        Item::create([
            'key' => 'choice-scarf',
            'name' => 'こだわりスカーフ',
            'description' => null,
        ]);

        $this->getJson('/api/items?search=こだわりすかーふ')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'こだわりスカーフ');
    }

    public function test_abilities_can_be_searched_with_hiragana_keyword(): void
    {
        Ability::create([
            'key' => 'multiscale',
            'name' => 'マルチスケイル',
        ]);

        $this->getJson('/api/abilities?search=まるちすけいる')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'マルチスケイル');
    }

    public function test_pokemon_abilities_can_be_fetched_by_pokemon_identifier(): void
    {
        $ability = Ability::create([
            'key' => 'rough-skin',
            'name' => 'さめはだ',
            'description' => '接触した相手にダメージを与える。',
        ]);

        PokemonAbility::create([
            'pokemon_key' => 'garchomp',
            'form_key' => 'default',
            'ability_id' => $ability->id,
            'is_hidden' => true,
        ]);

        $this->getJson('/api/pokemon-abilities?pokemon[]=garchomp:default')
            ->assertOk()
            ->assertJsonPath('data.0.pokemon_key', 'garchomp')
            ->assertJsonPath('data.0.form_key', 'default')
            ->assertJsonPath('data.0.abilities.0.name', 'さめはだ')
            ->assertJsonPath('data.0.abilities.0.is_hidden', true);
    }
}
