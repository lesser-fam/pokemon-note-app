<?php

namespace Tests\Feature;

use App\Models\Move;
use App\Models\PokemonCommonMove;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PokemonCommonMoveApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_common_moves_can_be_filtered_by_rule(): void
    {
        $move = Move::create([
            'key' => 'thunderbolt',
            'name' => '10まんボルト',
            'type' => 'でんき',
            'damage_class' => 'special',
            'power' => 90,
        ]);

        PokemonCommonMove::create([
            'rule' => 'main_series',
            'pokemon_key' => 'pikachu',
            'form_key' => 'default',
            'move_id' => $move->id,
            'usage_rank' => 1,
        ]);

        PokemonCommonMove::create([
            'rule' => 'champions',
            'pokemon_key' => 'pikachu',
            'form_key' => 'default',
            'move_id' => $move->id,
            'usage_rank' => 1,
        ]);

        $response = $this->getJson('/api/pokemon-common-moves?rule=champions&pokemon_key=pikachu&form_key=default');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.rule', 'champions');
    }

    public function test_non_admin_user_cannot_import_common_moves_csv(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->postJson('/api/pokemon-common-moves/import', [
                'csv_file' => UploadedFile::fake()->createWithContent(
                    'common_moves.csv',
                    "rule,pokemon_key,form_key,move_name,memo\nchampions,pikachu,default,10まんボルト,警戒技\n",
                ),
            ])
            ->assertForbidden();
    }

    public function test_admin_user_can_import_common_moves_csv(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        Move::create([
            'key' => 'thunderbolt',
            'name' => '10まんボルト',
            'type' => 'でんき',
            'damage_class' => 'special',
            'power' => 90,
        ]);

        $response = $this->actingAs($admin)
            ->postJson('/api/pokemon-common-moves/import', [
                'csv_file' => UploadedFile::fake()->createWithContent(
                    'common_moves.csv',
                    "rule,pokemon_key,form_key,move_name,memo\nchampions,pikachu,default,10まんボルト,警戒技\n",
                ),
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('imported_count', 1)
            ->assertJsonPath('updated_count', 0)
            ->assertJsonPath('error_count', 0);

        $this->assertDatabaseHas('pokemon_common_moves', [
            'rule' => 'champions',
            'pokemon_key' => 'pikachu',
            'form_key' => 'default',
            'memo' => '警戒技',
        ]);
    }
}
