<?php

namespace Tests\Feature;

use App\Models\OpponentPartyTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_user_cannot_create_opponent_party_template(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->postJson('/api/opponent-party-templates', $this->templatePayload())
            ->assertForbidden();

        $this->assertDatabaseCount('opponent_party_templates', 0);
    }

    public function test_admin_user_can_create_opponent_party_template(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)
            ->postJson('/api/opponent-party-templates', $this->templatePayload());

        $response->assertSuccessful();

        $template = OpponentPartyTemplate::query()->firstOrFail();

        $this->assertSame('main_series', $template->rule);
        $this->assertSame('Common ladder team', $template->memo);
        $this->assertCount(6, $template->pokemon);
    }

    private function templatePayload(): array
    {
        return [
            'rule' => 'main_series',
            'memo' => 'Common ladder team',
            'pokemon' => [
                ['pokemon_key' => 'dragonite', 'form_key' => 'default'],
                ['pokemon_key' => 'garchomp', 'form_key' => 'default'],
                ['pokemon_key' => 'mimikyu', 'form_key' => 'default'],
                ['pokemon_key' => 'snorlax', 'form_key' => 'default'],
                ['pokemon_key' => 'charizard', 'form_key' => 'default'],
                ['pokemon_key' => 'pikachu', 'form_key' => 'default'],
            ],
        ];
    }
}
