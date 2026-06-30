<?php

namespace Tests\Feature;

use App\Models\Ability;
use App\Models\Item;
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
}
