<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->call([
            RoleTagSeeder::class,
            NatureSeeder::class,

            /*
             * pokemon_abilities.csv を読み込み、
             * abilities に不足している特性を追加しながら、
             * ポケモンと特性を紐づける。
             */
            PokemonAbilitySeeder::class,

            /*
             * abilities が登録された後に、
             * 特性による相性補正を登録する。
             */
            AbilityEffectRuleSeeder::class,

            /*
             * items が登録された後に、
             * 持ち物による相性補正を登録する。
             */
            ItemEffectRuleSeeder::class,
        ]);
    }
}
