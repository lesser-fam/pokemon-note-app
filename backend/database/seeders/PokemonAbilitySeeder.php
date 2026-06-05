<?php

namespace Database\Seeders;

use App\Models\Ability;
use App\Models\PokemonAbility;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PokemonAbilitySeeder extends Seeder
{
    public function run(): void
    {
        $path = storage_path(
            'app/data/pokemon_abilities.csv',
        );

        if (! file_exists($path)) {
            throw new RuntimeException(
                'pokemon_abilities.csv が見つかりません。'
            );
        }

        $csv = file_get_contents($path);

        if ($csv === false) {
            throw new RuntimeException(
                'pokemon_abilities.csv を読み込めませんでした。'
            );
        }

        $lines = preg_split(
            "/\r\n|\n|\r/",
            trim($csv),
        );

        if (
            $lines === false
            || count($lines) <= 1
        ) {
            throw new RuntimeException(
                'pokemon_abilities.csv にデータがありません。'
            );
        }

        $header = str_getcsv(
            array_shift($lines),
        );

        $rows = collect($lines)
            ->filter(
                fn(string $line): bool =>
                trim($line) !== '',
            )
            ->map(function (
                string $line,
            ) use ($header): array {
                $row = array_combine(
                    $header,
                    str_getcsv($line),
                );

                if ($row === false) {
                    throw new RuntimeException(
                        'pokemon_abilities.csv の形式が正しくありません。'
                    );
                }

                return $row;
            });

        DB::transaction(
            function () use ($rows): void {
                /*
                 * 以前の代表例だけの登録や、
                 * 古いキー形式の登録を削除します。
                 *
                 * 例:
                 * rotom-wash:default
                 * ↓
                 * rotom:wash
                 */
                PokemonAbility::query()
                    ->delete();

                foreach ($rows as $row) {
                    $ability =
                        Ability::query()
                        ->updateOrCreate(
                            [
                                'key' =>
                                $row['ability_key'],
                            ],
                            [
                                'name' =>
                                $row['ability_name'],
                            ],
                        );

                    PokemonAbility::query()
                        ->updateOrCreate(
                            [
                                'pokemon_key' =>
                                $row['pokemon_key'],
                                'form_key' =>
                                $row['form_key'],
                                'ability_id' =>
                                $ability->id,
                            ],
                            [
                                'is_hidden' =>
                                (bool) (
                                    (int) $row['is_hidden']
                                ),
                            ],
                        );
                }
            },
        );
    }
}
