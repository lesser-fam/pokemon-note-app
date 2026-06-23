<?php

namespace Tests\Feature;

use App\Models\Party;
use App\Models\PartyVersion;
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
}
