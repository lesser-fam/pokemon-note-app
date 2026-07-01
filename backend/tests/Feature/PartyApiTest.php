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
        [$user, , $partyVersion] = $this->createPartyWithCurrentVersion();

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
        [$user, , $partyVersion] = $this->createPartyWithCurrentVersion();

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
            ->map(fn (string $pokemonKey) => PartyPokemon::create([
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
                ])->map(fn (string $pokemonKey) => [
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
