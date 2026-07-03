<?php

namespace Tests\Feature;

use App\Models\Party;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BattleLogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_battle_log(): void
    {
        [$user, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $response = $this->actingAs($user)->postJson(
            "/api/party-versions/{$partyVersion->id}/battle-logs",
            $this->validBattleLogPayload([
                'selected_pokemon_1_id' => $pokemon[0]->id,
                'selected_pokemon_2_id' => $pokemon[1]->id,
                'selected_pokemon_3_id' => $pokemon[2]->id,
                'selected_opponent_pokemon_1' => 'dragonite',
                'selected_opponent_form_1' => 'default',
                'selected_opponent_pokemon_2' => 'garchomp',
                'selected_opponent_form_2' => 'default',
                'selected_opponent_pokemon_3' => 'mimikyu',
                'selected_opponent_form_3' => 'default',
                'heavy_opponent_key' => 'dragonite',
                'heavy_opponent_form' => 'default',
                'needed_pokemon_id' => $pokemon[1]->id,
            ]),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.result', 'win')
            ->assertJsonPath('data.selected_pokemon_1_id', $pokemon[0]->id);

        $this->assertDatabaseHas('battle_logs', [
            'party_version_id' => $partyVersion->id,
            'result' => 'win',
            'selected_pokemon_1_id' => $pokemon[0]->id,
            'selected_pokemon_2_id' => $pokemon[1]->id,
            'selected_pokemon_3_id' => $pokemon[2]->id,
            'selected_opponent_pokemon_1' => 'dragonite',
            'selected_opponent_form_1' => 'default',
            'selected_opponent_pokemon_2' => 'garchomp',
            'selected_opponent_form_2' => 'default',
            'selected_opponent_pokemon_3' => 'mimikyu',
            'selected_opponent_form_3' => 'default',
            'heavy_opponent_key' => 'dragonite',
            'heavy_opponent_form' => 'default',
            'needed_pokemon_id' => $pokemon[1]->id,
        ]);
    }

    public function test_user_can_create_battle_log_with_one_selected_opponent_pokemon(): void
    {
        [$user, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $response = $this->actingAs($user)->postJson(
            "/api/party-versions/{$partyVersion->id}/battle-logs",
            $this->validBattleLogPayload([
                'selected_pokemon_1_id' => $pokemon[0]->id,
                'selected_pokemon_2_id' => $pokemon[1]->id,
                'selected_pokemon_3_id' => $pokemon[2]->id,
                'selected_opponent_pokemon_1' => 'dragonite',
                'selected_opponent_form_1' => 'default',
                'selected_opponent_pokemon_2' => null,
                'selected_opponent_form_2' => null,
                'selected_opponent_pokemon_3' => null,
                'selected_opponent_form_3' => null,
            ]),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('data.selected_opponent_pokemon_1', 'dragonite')
            ->assertJsonPath('data.selected_opponent_pokemon_2', null)
            ->assertJsonPath('data.selected_opponent_pokemon_3', null);

        $this->assertDatabaseHas('battle_logs', [
            'party_version_id' => $partyVersion->id,
            'selected_opponent_pokemon_1' => 'dragonite',
            'selected_opponent_pokemon_2' => null,
            'selected_opponent_pokemon_3' => null,
        ]);
    }

    public function test_selected_opponent_pokemon_is_required(): void
    {
        [$user, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                "/api/party-versions/{$partyVersion->id}/battle-logs",
                $this->validBattleLogPayload([
                    'selected_pokemon_1_id' => $pokemon[0]->id,
                    'selected_pokemon_2_id' => $pokemon[1]->id,
                    'selected_pokemon_3_id' => $pokemon[2]->id,
                    'selected_opponent_pokemon_1' => null,
                    'selected_opponent_form_1' => null,
                    'selected_opponent_pokemon_2' => null,
                    'selected_opponent_form_2' => null,
                    'selected_opponent_pokemon_3' => null,
                    'selected_opponent_form_3' => null,
                ]),
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('selected_opponent_pokemon_1');

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_duplicate_selected_own_pokemon_is_rejected(): void
    {
        [$user, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                "/api/party-versions/{$partyVersion->id}/battle-logs",
                $this->validBattleLogPayload([
                    'selected_pokemon_1_id' => $pokemon[0]->id,
                    'selected_pokemon_2_id' => $pokemon[0]->id,
                    'selected_pokemon_3_id' => $pokemon[2]->id,
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_user_cannot_use_pokemon_from_another_party_version(): void
    {
        [$user, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();
        [, , $otherPokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                "/api/party-versions/{$partyVersion->id}/battle-logs",
                $this->validBattleLogPayload([
                    'selected_pokemon_1_id' => $pokemon[0]->id,
                    'selected_pokemon_2_id' => $pokemon[1]->id,
                    'selected_pokemon_3_id' => $otherPokemon[0]->id,
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    private function createPartyVersionWithPokemon(): array
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

        $pokemon = collect(['pikachu', 'charizard', 'snorlax'])
            ->map(fn (string $pokemonKey) => PartyPokemon::create([
                'party_version_id' => $partyVersion->id,
                'pokemon_key' => $pokemonKey,
                'form_key' => 'default',
            ]))
            ->all();

        return [$user, $partyVersion, $pokemon];
    }

    private function validBattleLogPayload(array $overrides = []): array
    {
        return array_merge([
            'result' => 'win',
            'opponent_pokemon_1' => 'dragonite',
            'opponent_form_1' => 'default',
            'opponent_pokemon_2' => 'garchomp',
            'opponent_form_2' => 'default',
            'opponent_pokemon_3' => 'mimikyu',
            'opponent_form_3' => 'default',
            'selected_opponent_pokemon_1' => 'dragonite',
            'selected_opponent_form_1' => 'default',
            'selected_opponent_pokemon_2' => 'garchomp',
            'selected_opponent_form_2' => 'default',
            'selected_opponent_pokemon_3' => 'mimikyu',
            'selected_opponent_form_3' => 'default',
            'loss_tags' => [],
            'reflection' => 'Good selection.',
            'next_note' => 'Keep testing.',
        ], $overrides);
    }
}
