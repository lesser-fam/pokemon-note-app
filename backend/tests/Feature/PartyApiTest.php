<?php

namespace Tests\Feature;

use App\Models\Ability;
use App\Models\BattleLog;
use App\Models\Item;
use App\Models\Move;
use App\Models\Nature;
use App\Models\Party;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use App\Models\RoleTag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_party_with_initial_current_version(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/parties', [
            'name' => 'Rain Team',
            'rule' => 'main_series',
            'concept' => 'Use weather pressure.',
            'memo' => 'First draft.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Rain Team')
            ->assertJsonPath('data.current_version.version_number', 1)
            ->assertJsonPath('data.current_version.is_current', true);

        $this->assertDatabaseHas('parties', [
            'user_id' => $user->id,
            'name' => 'Rain Team',
            'rule' => 'main_series',
        ]);

        $this->assertDatabaseHas('party_versions', [
            'party_id' => $response->json('data.id'),
            'version_number' => 1,
            'is_current' => true,
        ]);
    }

    public function test_user_can_add_pokemon_to_party_version(): void
    {
        [$user,, $partyVersion] = $this->createPartyWithCurrentVersion();

        $item = Item::create([
            'key' => 'choice-scarf',
            'name' => 'こだわりスカーフ',
        ]);

        $ability = Ability::create([
            'key' => 'rough-skin',
            'name' => 'さめはだ',
        ]);

        $nature = Nature::create([
            'key' => 'jolly',
            'name' => 'ようき',
        ]);

        $move = Move::create([
            'key' => 'earthquake',
            'name' => 'じしん',
            'type' => 'じめん',
            'damage_class' => 'physical',
            'power' => 100,
        ]);

        $roleTag = RoleTag::create([
            'key' => 'sweeper',
            'name' => 'エース',
            'description' => '終盤に通す役割',
        ]);

        $response = $this->actingAs($user)->postJson(
            "/api/party-versions/{$partyVersion->id}/pokemon",
            [
                'pokemon_key' => 'garchomp',
                'form_key' => 'default',
                'nickname' => 'スカーフガブ',
                'item_id' => $item->id,
                'ability_id' => $ability->id,
                'nature_id' => $nature->id,
                'move_1_id' => $move->id,
                'ev_h' => 0,
                'ev_a' => 252,
                'ev_b' => 4,
                'ev_c' => 0,
                'ev_d' => 0,
                'ev_s' => 252,
                'memo' => '初手性能を見る',
                'role_tag_ids' => [$roleTag->id],
            ],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.pokemon_key', 'garchomp')
            ->assertJsonPath('data.item', 'こだわりスカーフ')
            ->assertJsonPath('data.ability', 'さめはだ')
            ->assertJsonPath('data.move_1', 'じしん')
            ->assertJsonPath('data.move_1_type', 'じめん');

        $partyPokemonId = $response->json('data.id');

        $this->assertDatabaseHas('party_pokemon', [
            'id' => $partyPokemonId,
            'party_version_id' => $partyVersion->id,
            'pokemon_key' => 'garchomp',
            'item_id' => $item->id,
            'ability_id' => $ability->id,
            'nature_id' => $nature->id,
            'move_1_id' => $move->id,
            'ev_a' => 252,
            'ev_s' => 252,
        ]);

        $this->assertDatabaseHas('party_pokemon_role_tags', [
            'party_pokemon_id' => $partyPokemonId,
            'role_tag_id' => $roleTag->id,
        ]);
    }

    public function test_party_version_cannot_have_more_than_six_pokemon(): void
    {
        [$user,, $partyVersion] = $this->createPartyWithCurrentVersion();

        foreach ($this->pokemonKeys() as $pokemonKey) {
            PartyPokemon::create([
                'party_version_id' => $partyVersion->id,
                'pokemon_key' => $pokemonKey,
                'form_key' => 'default',
            ]);
        }

        $this->actingAs($user)
            ->postJson("/api/party-versions/{$partyVersion->id}/pokemon", [
                'pokemon_key' => 'dragonite',
                'form_key' => 'default',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'ポケモンは6匹まで登録できます。');

        $this->assertDatabaseCount('party_pokemon', 6);
    }

    public function test_user_can_create_new_party_version_while_preserving_old_version_and_logs(): void
    {
        [$user, $party, $oldPartyVersion] = $this->createPartyWithCurrentVersion();

        $oldPokemon = collect($this->pokemonKeys())
            ->map(fn(string $pokemonKey) => PartyPokemon::create([
                'party_version_id' => $oldPartyVersion->id,
                'pokemon_key' => $pokemonKey,
                'form_key' => 'default',
            ]));

        $battleLog = BattleLog::create([
            'party_version_id' => $oldPartyVersion->id,
            'result' => 'lose',
            'selected_pokemon_1_id' => $oldPokemon[0]->id,
            'selected_pokemon_2_id' => $oldPokemon[1]->id,
            'selected_pokemon_3_id' => $oldPokemon[2]->id,
            'heavy_opponent_key' => 'dragonite',
            'heavy_opponent_form' => 'default',
        ]);

        $response = $this->actingAs($user)->postJson(
            "/api/party-versions/{$oldPartyVersion->id}/new-version",
            [
                'change_note' => '高速アタッカーを増やす',
                'pokemon' => collect([
                    'garchomp',
                    'charizard',
                    'snorlax',
                    'mimikyu',
                    'dragonite',
                    'pikachu',
                ])->map(fn(string $pokemonKey) => [
                    'pokemon_key' => $pokemonKey,
                    'form_key' => 'default',
                ])->all(),
            ],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.version_number', 2)
            ->assertJsonPath('data.is_current', true)
            ->assertJsonCount(6, 'data.pokemon');

        $oldPartyVersion->refresh();
        $newPartyVersionId = $response->json('data.id');

        $this->assertFalse($oldPartyVersion->is_current);
        $this->assertDatabaseHas('party_versions', [
            'id' => $newPartyVersionId,
            'party_id' => $party->id,
            'version_number' => 2,
            'change_note' => '高速アタッカーを増やす',
            'is_current' => true,
        ]);
        $this->assertDatabaseHas('battle_logs', [
            'id' => $battleLog->id,
            'party_version_id' => $oldPartyVersion->id,
        ]);
        $this->assertSame(6, PartyPokemon::where('party_version_id', $newPartyVersionId)->count());
    }

    public function test_user_cannot_view_another_users_party(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $party = Party::create([
            'user_id' => $owner->id,
            'name' => 'Private Team',
            'rule' => 'main_series',
        ]);

        PartyVersion::create([
            'party_id' => $party->id,
            'version_number' => 1,
            'is_current' => true,
        ]);

        $this->actingAs($otherUser)
            ->getJson("/api/parties/{$party->id}")
            ->assertNotFound();
    }

    public function test_user_can_duplicate_six_pokemon_party(): void
    {
        [$user, $party, $sourceVersion] = $this->createPartyWithCurrentVersion();

        $party->update([
            'rule' => 'champions',
            'concept' => 'コピー元コンセプト',
            'memo' => 'コピー元メモ',
        ]);

        $item = Item::create([
            'key' => 'choice-scarf',
            'name' => 'こだわりスカーフ',
        ]);
        $ability = Ability::create([
            'key' => 'rough-skin',
            'name' => 'さめはだ',
        ]);
        $nature = Nature::create([
            'key' => 'jolly',
            'name' => 'ようき',
        ]);
        $moves = collect([
            ['earthquake', 'じしん', 'じめん', 'physical', 100],
            ['dragon-claw', 'ドラゴンクロー', 'ドラゴン', 'physical', 80],
            ['fire-blast', 'だいもんじ', 'ほのお', 'special', 110],
            ['protect', 'まもる', 'ノーマル', 'status', null],
        ])->map(fn(array $move) => Move::create([
            'key' => $move[0],
            'name' => $move[1],
            'type' => $move[2],
            'damage_class' => $move[3],
            'power' => $move[4],
        ]));
        $roleTags = collect([
            ['lead', '初手'],
            ['sweeper', 'エース'],
        ])->map(fn(array $roleTag) => RoleTag::create([
            'key' => $roleTag[0],
            'name' => $roleTag[1],
            'description' => '複製テスト用',
        ]));

        $sourcePokemon = collect($this->pokemonKeys())
            ->map(function (string $pokemonKey, int $index) use (
                $sourceVersion,
                $item,
                $ability,
                $nature,
                $moves,
            ) {
                return PartyPokemon::create([
                    'party_version_id' => $sourceVersion->id,
                    'pokemon_key' => $pokemonKey,
                    'form_key' => $index === 0 ? 'special-form' : 'default',
                    'nickname' => "nickname-{$index}",
                    'item' => $item->name,
                    'item_id' => $item->id,
                    'ability' => $ability->name,
                    'ability_id' => $ability->id,
                    'nature' => $nature->name,
                    'nature_id' => $nature->id,
                    'ev_h' => $index,
                    'ev_a' => 252,
                    'ev_b' => 4,
                    'ev_c' => 0,
                    'ev_d' => 0,
                    'ev_s' => 252 - $index,
                    'move_1' => $moves[0]->name,
                    'move_1_id' => $moves[0]->id,
                    'move_1_type' => $moves[0]->type,
                    'move_2' => $moves[1]->name,
                    'move_2_id' => $moves[1]->id,
                    'move_2_type' => $moves[1]->type,
                    'move_3' => $moves[2]->name,
                    'move_3_id' => $moves[2]->id,
                    'move_3_type' => $moves[2]->type,
                    'move_4' => $moves[3]->name,
                    'move_4_id' => $moves[3]->id,
                    'move_4_type' => $moves[3]->type,
                    'memo' => "pokemon memo {$index}",
                ]);
            });

        $sourcePokemon[0]->roleTags()->sync($roleTags->pluck('id')->all());
        $sourcePokemon[1]->roleTags()->sync([$roleTags[1]->id]);

        $sourceVersion->selectionTemplates()->create([
            'name' => 'コピーしない基本選出',
            'lead_pokemon_id' => $sourcePokemon[0]->id,
            'switch_pokemon_id' => $sourcePokemon[1]->id,
            'finisher_pokemon_id' => $sourcePokemon[2]->id,
        ]);
        BattleLog::create([
            'party_version_id' => $sourceVersion->id,
            'result' => 'win',
            'selected_pokemon_1_id' => $sourcePokemon[0]->id,
            'selected_pokemon_2_id' => $sourcePokemon[1]->id,
            'selected_pokemon_3_id' => $sourcePokemon[2]->id,
        ]);

        $response = $this->actingAs($user)->postJson(
            "/api/parties/{$party->id}/duplicate",
            [
                'name' => '複製したパーティ',
                'concept' => '新しいコンセプト',
                'memo' => '新しいメモ',
                'rule' => 'main_series',
            ],
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', '複製したパーティ')
            ->assertJsonPath('data.rule', 'champions')
            ->assertJsonPath('data.concept', '新しいコンセプト')
            ->assertJsonPath('data.memo', '新しいメモ')
            ->assertJsonPath('data.current_version.version_number', 1)
            ->assertJsonPath('data.current_version.is_current', true)
            ->assertJsonCount(6, 'data.current_version.pokemon');

        $duplicatedParty = Party::with(
            'versions.pokemon.roleTags',
            'versions.selectionTemplates',
            'versions.battleLogs',
        )->findOrFail($response->json('data.id'));
        $newVersion = $duplicatedParty->versions->sole();

        $this->assertNotSame($party->id, $duplicatedParty->id);
        $this->assertSame($user->id, $duplicatedParty->user_id);
        $this->assertSame(1, $newVersion->version_number);
        $this->assertTrue($newVersion->is_current);
        $this->assertCount(6, $newVersion->pokemon);
        $this->assertCount(0, $newVersion->selectionTemplates);
        $this->assertCount(0, $newVersion->battleLogs);

        $copyFields = [
            'pokemon_key',
            'form_key',
            'nickname',
            'item',
            'item_id',
            'ability',
            'ability_id',
            'nature',
            'nature_id',
            'ev_h',
            'ev_a',
            'ev_b',
            'ev_c',
            'ev_d',
            'ev_s',
            'move_1',
            'move_1_id',
            'move_1_type',
            'move_2',
            'move_2_id',
            'move_2_type',
            'move_3',
            'move_3_id',
            'move_3_type',
            'move_4',
            'move_4_id',
            'move_4_type',
            'memo',
        ];
        $newPokemonByKey = $newVersion->pokemon->keyBy('pokemon_key');

        foreach ($sourcePokemon as $pokemon) {
            $duplicatedPokemon = $newPokemonByKey->get($pokemon->pokemon_key);

            $this->assertNotNull($duplicatedPokemon);
            $this->assertNotSame($pokemon->id, $duplicatedPokemon->id);
            $this->assertSame(
                $pokemon->only($copyFields),
                $duplicatedPokemon->only($copyFields),
            );
            $this->assertEqualsCanonicalizing(
                $pokemon->roleTags()->pluck('role_tags.id')->all(),
                $duplicatedPokemon->roleTags->modelKeys(),
            );
        }

        $party->refresh();
        $sourceVersion->refresh();

        $this->assertSame('Test Party', $party->name);
        $this->assertTrue($sourceVersion->is_current);
        $this->assertSame(6, $sourceVersion->pokemon()->count());
        $this->assertSame(1, $sourceVersion->selectionTemplates()->count());
        $this->assertSame(1, $sourceVersion->battleLogs()->count());
    }

    public function test_duplicate_uses_only_source_current_version(): void
    {
        [$user, $party, $oldVersion] = $this->createPartyWithCurrentVersion();

        $oldVersion->update(['is_current' => false]);

        foreach ($this->pokemonKeys() as $pokemonKey) {
            PartyPokemon::create([
                'party_version_id' => $oldVersion->id,
                'pokemon_key' => "old-{$pokemonKey}",
                'form_key' => 'default',
            ]);
        }

        $currentVersion = PartyVersion::create([
            'party_id' => $party->id,
            'version_number' => 2,
            'is_current' => true,
        ]);

        foreach ($this->pokemonKeys() as $pokemonKey) {
            PartyPokemon::create([
                'party_version_id' => $currentVersion->id,
                'pokemon_key' => "current-{$pokemonKey}",
                'form_key' => 'default',
            ]);
        }

        $response = $this->actingAs($user)->postJson(
            "/api/parties/{$party->id}/duplicate",
            ['name' => 'Current Version Copy'],
        );

        $response->assertCreated();

        $newPartyId = $response->json('data.id');
        $newVersion = PartyVersion::where('party_id', $newPartyId)->sole();

        $this->assertSame(1, PartyVersion::where('party_id', $newPartyId)->count());
        $this->assertEqualsCanonicalizing(
            collect($this->pokemonKeys())
                ->map(fn(string $pokemonKey) => "current-{$pokemonKey}")
                ->all(),
            $newVersion->pokemon()->pluck('pokemon_key')->all(),
        );
    }

    public function test_user_cannot_duplicate_another_users_party(): void
    {
        [$owner, $party, $partyVersion] = $this->createPartyWithCurrentVersion();

        foreach ($this->pokemonKeys() as $pokemonKey) {
            PartyPokemon::create([
                'party_version_id' => $partyVersion->id,
                'pokemon_key' => $pokemonKey,
                'form_key' => 'default',
            ]);
        }

        $otherUser = User::factory()->create();
        $partyCount = Party::count();

        $this->actingAs($otherUser)
            ->postJson("/api/parties/{$party->id}/duplicate", [
                'name' => 'Unauthorized Copy',
            ])
            ->assertNotFound();

        $this->assertSame($partyCount, Party::count());
        $this->assertSame($owner->id, $party->user_id);
    }

    public function test_party_with_invalid_pokemon_count_cannot_be_duplicated(): void
    {
        foreach ([0, 5, 7] as $pokemonCount) {
            [$user, $party, $partyVersion] = $this->createPartyWithCurrentVersion();

            for ($index = 0; $index < $pokemonCount; $index++) {
                PartyPokemon::create([
                    'party_version_id' => $partyVersion->id,
                    'pokemon_key' => "pokemon-{$pokemonCount}-{$index}",
                    'form_key' => 'default',
                ]);
            }

            $partyCountBeforeRequest = Party::count();

            $this->actingAs($user)
                ->postJson("/api/parties/{$party->id}/duplicate", [
                    'name' => 'Invalid Count Copy',
                ])
                ->assertUnprocessable()
                ->assertJsonPath(
                    'message',
                    'パーティを複製するには、現在のバージョンにポケモンを6匹登録してください。',
                );

            $this->assertSame($partyCountBeforeRequest, Party::count());
        }
    }

    public function test_party_without_current_version_cannot_be_duplicated(): void
    {
        [$user, $party, $partyVersion] = $this->createPartyWithCurrentVersion();

        $partyVersion->update(['is_current' => false]);

        $this->actingAs($user)
            ->postJson("/api/parties/{$party->id}/duplicate", [
                'name' => 'No Current Version Copy',
            ])
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'パーティを複製するには、現在のバージョンにポケモンを6匹登録してください。',
            );
    }

    public function test_duplicate_party_validates_name(): void
    {
        [$user, $party, $partyVersion] = $this->createPartyWithCurrentVersion();

        foreach ($this->pokemonKeys() as $pokemonKey) {
            PartyPokemon::create([
                'party_version_id' => $partyVersion->id,
                'pokemon_key' => $pokemonKey,
                'form_key' => 'default',
            ]);
        }

        $this->actingAs($user)
            ->postJson("/api/parties/{$party->id}/duplicate", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->actingAs($user)
            ->postJson("/api/parties/{$party->id}/duplicate", [
                'name' => str_repeat('a', 256),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    private function createPartyWithCurrentVersion(): array
    {
        $user = User::factory()->create();
        $party = Party::create([
            'user_id' => $user->id,
            'name' => 'Test Party',
            'rule' => 'main_series',
        ]);
        $partyVersion = PartyVersion::create([
            'party_id' => $party->id,
            'version_number' => 1,
            'is_current' => true,
        ]);

        return [$user, $party, $partyVersion];
    }

    private function pokemonKeys(): array
    {
        return [
            'pikachu',
            'charizard',
            'snorlax',
            'mimikyu',
            'garchomp',
            'lucario',
        ];
    }
}
