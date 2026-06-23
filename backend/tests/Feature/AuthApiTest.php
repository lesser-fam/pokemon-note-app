<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_fetch_current_user(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'new-user@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.email', 'new-user@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'new-user@example.com',
            'is_admin' => false,
        ]);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.email', 'new-user@example.com')
            ->assertJsonPath('user.is_admin', false);
    }

    public function test_user_can_login_and_logout(): void
    {
        User::factory()->create([
            'email' => 'login-user@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/login', [
            'email' => 'login-user@example.com',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'login-user@example.com');

        $this->postJson('/api/logout')->assertOk();
    }

    public function test_guest_cannot_fetch_current_user(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
