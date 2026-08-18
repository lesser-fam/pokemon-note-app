<?php

namespace Tests\Feature;

use App\Models\BattleLog;
use App\Models\Party;
use App\Models\PartyPokemon;
use App\Models\PartyVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuickBattleLogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_winning_quick_battle_log_with_minimum_fields(): void
    {
        [$user, $party, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $response = $this->actingAs($user)->postJson(
            $this->quickLogUrl($partyVersion),
            $this->validQuickPayload($pokemon),
        );

        $response
            ->assertCreated()
            ->assertJsonPath('message', '対戦ログを保存しました。')
            ->assertJsonPath('data.party_version_id', $partyVersion->id)
            ->assertJsonPath('data.result', 'win')
            ->assertJsonPath('data.opponent_pokemon_2', null)
            ->assertJsonPath('data.selected_opponent_pokemon_2', null)
            ->assertJsonPath('data.reflection', null);

        $battleLog = BattleLog::firstOrFail();

        $this->assertSame($partyVersion->id, $battleLog->party_version_id);
        $this->assertSame($pokemon[0]->id, $battleLog->selected_pokemon_1_id);
        $this->assertSame($pokemon[1]->id, $battleLog->selected_pokemon_2_id);
        $this->assertSame($pokemon[2]->id, $battleLog->selected_pokemon_3_id);
        $this->assertNull($battleLog->heavy_opponent_key);
        $this->assertNull($battleLog->needed_pokemon_id);
        $this->assertNull($battleLog->loss_tags);
        $this->assertNull($battleLog->reflection);
        $this->assertNull($battleLog->next_note);
        $this->assertNotNull($battleLog->created_at);
    }

    public function test_user_can_create_losing_quick_battle_log(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, ['result' => 'lose']),
            )
            ->assertCreated()
            ->assertJsonPath('data.result', 'lose');

        $this->assertDatabaseHas('battle_logs', [
            'party_version_id' => $partyVersion->id,
            'result' => 'lose',
        ]);
    }

    public function test_optional_opponent_slots_can_all_be_saved(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $payload = $this->validQuickPayload($pokemon, [
            'opponent_pokemon_2' => 'garchomp',
            'opponent_form_2' => 'default',
            'opponent_pokemon_3' => 'mimikyu',
            'opponent_form_3' => 'default',
            'opponent_pokemon_4' => 'rotom',
            'opponent_form_4' => 'wash',
            'opponent_pokemon_5' => 'gholdengo',
            'opponent_form_5' => 'default',
            'opponent_pokemon_6' => 'ursaluna',
            'opponent_form_6' => 'bloodmoon',
            'selected_opponent_pokemon_2' => 'garchomp',
            'selected_opponent_form_2' => 'default',
            'selected_opponent_pokemon_3' => 'mimikyu',
            'selected_opponent_form_3' => 'default',
        ]);

        $this->actingAs($user)
            ->postJson($this->quickLogUrl($partyVersion), $payload)
            ->assertCreated()
            ->assertJsonPath('data.opponent_pokemon_6', 'ursaluna')
            ->assertJsonPath('data.selected_opponent_pokemon_3', 'mimikyu');
    }

    public function test_first_opponent_pokemon_is_required(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, ['opponent_pokemon_1' => null]),
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('opponent_pokemon_1');

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_exactly_three_own_pokemon_are_required(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();
        $payload = $this->validQuickPayload($pokemon);
        unset($payload['selected_pokemon_3_id']);

        $this->actingAs($user)
            ->postJson($this->quickLogUrl($partyVersion), $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('selected_pokemon_3_id');

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_duplicate_own_pokemon_are_rejected(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, [
                    'selected_pokemon_2_id' => $pokemon[0]->id,
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_first_selected_opponent_pokemon_is_required(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, [
                    'selected_opponent_pokemon_1' => null,
                ]),
            )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('selected_opponent_pokemon_1');

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_duplicate_selected_opponent_pokemon_are_rejected(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, [
                    'opponent_pokemon_2' => 'dragonite',
                    'opponent_form_2' => 'default',
                    'selected_opponent_pokemon_2' => 'dragonite',
                    'selected_opponent_form_2' => 'default',
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_selected_opponent_must_exist_in_opponent_party(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, [
                    'selected_opponent_pokemon_1' => 'garchomp',
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_own_pokemon_from_another_party_version_are_rejected(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();
        [, , , $otherPokemon] = $this->createPartyVersionWithPokemon($user);

        $this->actingAs($user)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon, [
                    'selected_pokemon_3_id' => $otherPokemon[0]->id,
                ]),
            )
            ->assertUnprocessable();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_user_cannot_create_quick_log_for_another_users_party_version(): void
    {
        [$owner, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->postJson(
                $this->quickLogUrl($partyVersion),
                $this->validQuickPayload($pokemon),
            )
            ->assertNotFound();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_guest_cannot_create_quick_battle_log(): void
    {
        [, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $this->postJson(
            $this->quickLogUrl($partyVersion),
            $this->validQuickPayload($pokemon),
        )->assertUnauthorized();

        $this->assertDatabaseCount('battle_logs', 0);
    }

    public function test_quick_log_is_returned_by_party_detail_for_current_and_all_versions(): void
    {
        [$user, $party, $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $createdResponse = $this->actingAs($user)->postJson(
            $this->quickLogUrl($partyVersion),
            $this->validQuickPayload($pokemon),
        );

        $battleLogId = $createdResponse->json('data.id');

        $this->actingAs($user)
            ->getJson("/api/parties/{$party->id}")
            ->assertOk()
            ->assertJsonPath('data.current_version.battle_logs.0.id', $battleLogId)
            ->assertJsonPath('data.versions.0.battle_logs.0.id', $battleLogId);
    }

    public function test_quick_log_can_be_updated_by_existing_edit_endpoint(): void
    {
        [$user, , $partyVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $createdResponse = $this->actingAs($user)->postJson(
            $this->quickLogUrl($partyVersion),
            $this->validQuickPayload($pokemon),
        );

        $battleLogId = $createdResponse->json('data.id');

        $this->actingAs($user)
            ->putJson(
                "/api/battle-logs/{$battleLogId}",
                array_merge($this->validQuickPayload($pokemon), [
                    'reflection' => '編集画面から詳細を追加',
                    'next_note' => '次回のメモ',
                    'loss_tags' => [],
                ]),
            )
            ->assertOk()
            ->assertJsonPath('data.reflection', '編集画面から詳細を追加');

        $this->assertDatabaseHas('battle_logs', [
            'id' => $battleLogId,
            'reflection' => '編集画面から詳細を追加',
            'next_note' => '次回のメモ',
        ]);
    }

    public function test_quick_log_keeps_historical_party_version_after_new_version_is_created(): void
    {
        [$user, $party, $oldVersion, $pokemon] = $this->createPartyVersionWithPokemon();

        $createdResponse = $this->actingAs($user)->postJson(
            $this->quickLogUrl($oldVersion),
            $this->validQuickPayload($pokemon),
        );

        $battleLogId = $createdResponse->json('data.id');

        $oldVersion->update(['is_current' => false]);

        $newVersion = PartyVersion::create([
            'party_id' => $party->id,
            'version_number' => 2,
            'is_current' => true,
        ]);

        $this->actingAs($user)
            ->getJson("/api/parties/{$party->id}")
            ->assertOk()
            ->assertJsonCount(0, 'data.current_version.battle_logs')
            ->assertJsonFragment([
                'id' => $battleLogId,
                'party_version_id' => $oldVersion->id,
            ]);

        $this->assertDatabaseHas('battle_logs', [
            'id' => $battleLogId,
            'party_version_id' => $oldVersion->id,
        ]);
        $this->assertNotSame($newVersion->id, $oldVersion->id);
    }

    private function createPartyVersionWithPokemon(?User $user = null): array
    {
        $user ??= User::factory()->create();

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

        return [$user, $party, $partyVersion, $pokemon];
    }

    private function validQuickPayload(array $pokemon, array $overrides = []): array
    {
        return array_merge([
            'result' => 'win',
            'opponent_pokemon_1' => 'dragonite',
            'opponent_form_1' => 'default',
            'selected_pokemon_1_id' => $pokemon[0]->id,
            'selected_pokemon_2_id' => $pokemon[1]->id,
            'selected_pokemon_3_id' => $pokemon[2]->id,
            'selected_opponent_pokemon_1' => 'dragonite',
            'selected_opponent_form_1' => 'default',
        ], $overrides);
    }

    private function quickLogUrl(PartyVersion $partyVersion): string
    {
        return "/api/party-versions/{$partyVersion->id}/battle-logs/quick";
    }
}
