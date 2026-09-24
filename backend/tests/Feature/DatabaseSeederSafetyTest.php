<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class DatabaseSeederSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_seeding_skips_fixed_development_users_and_calls_master_seeders(): void
    {
        $this->runInEnvironment('production', function (): void {
            $this->runDatabaseSeederWithMasterSeedersMocked();

            $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
            $this->assertDatabaseMissing('users', ['email' => 'admin@example.com']);
        });
    }

    public function test_non_production_seeding_keeps_development_users_and_calls_master_seeders(): void
    {
        $this->runInEnvironment('testing', function (): void {
            $this->runDatabaseSeederWithMasterSeedersMocked();

            $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'is_admin' => false]);
            $this->assertDatabaseHas('users', ['email' => 'admin@example.com', 'is_admin' => true]);
        });
    }

    private function runDatabaseSeederWithMasterSeedersMocked(): void
    {
        $seeder = Mockery::mock(DatabaseSeeder::class)->makePartial();
        $seeder->shouldReceive('call')->once()->with(Mockery::type('array'));
        $seeder->setContainer($this->app);
        $seeder->run();
    }

    private function runInEnvironment(string $environment, callable $callback): void
    {
        $originalEnvironment = $this->app->environment();
        $this->app->detectEnvironment(fn (): string => $environment);

        try {
            $callback();
        } finally {
            $this->app->detectEnvironment(fn (): string => $originalEnvironment);
        }
    }
}
