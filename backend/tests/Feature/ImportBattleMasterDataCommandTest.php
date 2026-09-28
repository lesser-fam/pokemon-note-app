<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ImportBattleMasterDataCommandTest extends TestCase
{
    use RefreshDatabase;

    private const BASE_URL = 'https://pokeapi.co/api/v2';

    public function test_it_returns_success_when_all_resources_are_imported(): void
    {
        Http::fake([
            self::BASE_URL.'/move/?*' => Http::response([
                'results' => [$this->resourceListItem('test-move', 'move')],
            ]),
            self::BASE_URL.'/move/test-move' => Http::response(
                $this->moveData('test-move'),
            ),
        ]);

        $this->artisan('app:import-battle-master-data', ['resource' => 'moves'])
            ->expectsOutput('成功: 1件')
            ->expectsOutput('失敗: 0件')
            ->expectsOutput('マスターデータの取り込みが完了しました。')
            ->assertSuccessful();

        $this->assertDatabaseHas('moves', ['key' => 'test-move']);
    }

    public function test_it_returns_failure_when_a_resource_detail_cannot_be_fetched(): void
    {
        Http::fake([
            self::BASE_URL.'/move/?*' => Http::response([
                'results' => [
                    $this->resourceListItem('successful-move', 'move'),
                    $this->resourceListItem('failed-move', 'move'),
                ],
            ]),
            self::BASE_URL.'/move/successful-move' => Http::response(
                $this->moveData('successful-move'),
            ),
            self::BASE_URL.'/move/failed-move' => Http::response([], 500),
        ]);

        $this->artisan('app:import-battle-master-data', ['resource' => 'moves'])
            ->expectsOutput('成功: 1件')
            ->expectsOutput('失敗: 1件')
            ->doesntExpectOutput('マスターデータの取り込みが完了しました。')
            ->assertFailed();

        $this->assertDatabaseHas('moves', ['key' => 'successful-move']);
        $this->assertDatabaseMissing('moves', ['key' => 'failed-move']);
    }

    public function test_all_returns_failure_when_any_resource_import_fails(): void
    {
        Http::fake(function (Request $request) {
            return match ($request->url()) {
                self::BASE_URL.'/move/?limit=100000' => Http::response([
                    'results' => [$this->resourceListItem('test-move', 'move')],
                ]),
                self::BASE_URL.'/move/test-move' => Http::response(
                    $this->moveData('test-move'),
                ),
                self::BASE_URL.'/ability/?limit=100000' => Http::response([
                    'results' => [
                        $this->resourceListItem('failed-ability', 'ability'),
                    ],
                ]),
                self::BASE_URL.'/ability/failed-ability' => Http::response([], 500),
                self::BASE_URL.'/item/?limit=100000' => Http::response([
                    'results' => [$this->resourceListItem('test-item', 'item')],
                ]),
                self::BASE_URL.'/item/test-item' => Http::response(
                    $this->itemData('test-item'),
                ),
                default => Http::response([], 404),
            };
        });

        $this->artisan('app:import-battle-master-data', ['resource' => 'all'])
            ->expectsOutput('マスターデータの取り込みに失敗しました。失敗: 1件')
            ->doesntExpectOutput('マスターデータの取り込みが完了しました。')
            ->assertFailed();

        $this->assertDatabaseHas('moves', ['key' => 'test-move']);
        $this->assertDatabaseMissing('abilities', ['key' => 'failed-ability']);
        $this->assertDatabaseHas('items', ['key' => 'test-item']);
    }

    private function resourceListItem(string $key, string $endpoint): array
    {
        return [
            'name' => $key,
            'url' => self::BASE_URL."/{$endpoint}/{$key}",
        ];
    }

    private function moveData(string $key): array
    {
        return [
            'name' => $key,
            'names' => [],
            'type' => ['name' => 'normal'],
            'damage_class' => ['name' => 'physical'],
            'power' => 40,
        ];
    }

    private function itemData(string $key): array
    {
        return [
            'name' => $key,
            'names' => [],
            'flavor_text_entries' => [],
        ];
    }
}
