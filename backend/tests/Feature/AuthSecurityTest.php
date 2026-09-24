<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_processed_below_the_email_limit_and_blocked_above_it(): void
    {
        User::factory()->create([
            'email' => 'target@example.com',
            'password' => 'correct-password',
        ]);

        for ($attempt = 1; $attempt <= 4; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
                ->postJson('/api/login', [
                    'email' => 'target@example.com',
                    'password' => 'wrong-password',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
            ->postJson('/api/login', [
                'email' => 'target@example.com',
                'password' => 'correct-password',
            ])
            ->assertOk();

        $response = $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])
            ->postJson('/api/login', [
                'email' => 'target@example.com',
                'password' => 'correct-password',
            ])
            ->assertTooManyRequests();

        $this->assertArrayNotHasKey('exception', $response->json());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control', ''));
    }

    public function test_login_email_limit_is_shared_across_ips_and_normalizes_email(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $email = $attempt % 2 === 0 ? ' TARGET@EXAMPLE.COM ' : 'target@example.com';

            $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.'.(10 + $attempt)])
                ->postJson('/api/login', [
                    'email' => $email,
                    'password' => 'wrong-password',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.99'])
            ->postJson('/api/login', [
                'email' => 'target@example.com',
                'password' => 'wrong-password',
            ])
            ->assertTooManyRequests();
    }

    public function test_login_ip_limit_blocks_many_accounts_without_merging_email_keys(): void
    {
        for ($attempt = 1; $attempt <= 20; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
                ->postJson('/api/login', [
                    'email' => "unknown-{$attempt}@example.com",
                    'password' => 'wrong-password',
                ])
                ->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/api/login', [
                'email' => 'another-account@example.com',
                'password' => 'wrong-password',
            ])
            ->assertTooManyRequests();
    }

    public function test_register_is_processed_below_the_ip_limit_and_blocked_above_it(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
                ->postJson('/api/register', [
                    'name' => "User {$attempt}",
                    'email' => "user-{$attempt}@example.com",
                    'password' => 'password',
                    'password_confirmation' => 'password',
                ])
                ->assertCreated();
        }

        $response = $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.10'])
            ->postJson('/api/register', [
                'name' => 'Blocked User',
                'email' => 'blocked@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertTooManyRequests();

        $this->assertArrayNotHasKey('exception', $response->json());
    }

    public function test_private_responses_are_not_cacheable_and_public_master_response_is_unchanged(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $userResponse = $this->getJson('/api/user')->assertOk();
        $partyResponse = $this->getJson('/api/parties')->assertOk();
        $publicResponse = $this->getJson('/api/pokemon')->assertOk();

        $this->assertStringContainsString('no-store', $userResponse->headers->get('Cache-Control', ''));
        $this->assertStringContainsString('no-store', $partyResponse->headers->get('Cache-Control', ''));
        $this->assertStringNotContainsString('no-store', $publicResponse->headers->get('Cache-Control', ''));
    }
}
