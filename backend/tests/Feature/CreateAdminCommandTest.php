<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_administrator_with_a_hashed_password(): void
    {
        $this->artisan('app:create-admin')
            ->expectsQuestion('Name', 'Production Admin')
            ->expectsQuestion('Email', 'ADMIN@EXAMPLE.COM')
            ->expectsQuestion('Password', 'secure-password')
            ->expectsQuestion('Confirm password', 'secure-password')
            ->expectsOutput('管理者ユーザーを作成しました。')
            ->assertSuccessful();

        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

        $this->assertTrue($admin->is_admin);
        $this->assertNotSame('secure-password', $admin->password);
        $this->assertTrue(Hash::check('secure-password', $admin->password));
    }

    public function test_it_does_not_promote_or_replace_an_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'is_admin' => false,
        ]);

        $this->artisan('app:create-admin')
            ->expectsQuestion('Name', 'Duplicate Admin')
            ->expectsQuestion('Email', 'existing@example.com')
            ->expectsQuestion('Password', 'secure-password')
            ->expectsQuestion('Confirm password', 'secure-password')
            ->assertFailed();

        $this->assertDatabaseCount('users', 1);
        $this->assertFalse($user->fresh()->is_admin);
    }

    public function test_it_rejects_invalid_input_without_creating_a_user(): void
    {
        $this->artisan('app:create-admin')
            ->expectsQuestion('Name', '')
            ->expectsQuestion('Email', 'not-an-email')
            ->expectsQuestion('Password', 'short')
            ->expectsQuestion('Confirm password', 'different')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
