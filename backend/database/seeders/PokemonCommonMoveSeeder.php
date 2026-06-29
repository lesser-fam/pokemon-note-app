<?php

namespace Database\Seeders;

use App\Models\Move;
use App\Models\PokemonCommonMove;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PokemonCommonMoveSeeder extends Seeder
{
    private const EXPECTED_HEADER = [
        'rule',
        'pokemon_key',
        'form_key',
        'move_name',
        'memo',
    ];

    public function run(): void
    {
        $path = storage_path('app/data/pokemon_common_moves_champions.csv');

        if (! file_exists($path)) {
            throw new RuntimeException('pokemon_common_moves_champions.csv が見つかりません。');
        }

        $handle = fopen($path, 'rb');

        if ($handle === false) {
            throw new RuntimeException('pokemon_common_moves_champions.csv を読み込めませんでした。');
        }

        $header = fgetcsv($handle);

        if ($header === false || array_map('trim', $header) !== self::EXPECTED_HEADER) {
            fclose($handle);

            throw new RuntimeException('pokemon_common_moves_champions.csv のヘッダーが正しくありません。');
        }

        $moveIdsByName = Move::query()
            ->pluck('id', 'name');

        $rows = [];
        $rules = [];
        $rankByPokemon = [];
        $seenKeys = [];
        $errors = [];
        $lineNumber = 1;
        $now = now();

        while (($csvRow = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if (count($csvRow) === 1 && trim((string) $csvRow[0]) === '') {
                continue;
            }

            $values = array_pad($csvRow, count(self::EXPECTED_HEADER), '');
            [$rule, $pokemonKey, $formKey, $moveName, $memo] = array_map(
                'trim',
                array_slice($values, 0, count(self::EXPECTED_HEADER)),
            );

            $formKey = $formKey !== '' ? $formKey : 'default';

            if (! in_array($rule, ['main_series', 'champions'], true)) {
                $errors[] = "{$lineNumber}行目: ruleはmain_seriesまたはchampionsを指定してください。";
                continue;
            }

            if ($pokemonKey === '' || $moveName === '') {
                $errors[] = "{$lineNumber}行目: pokemon_keyとmove_nameは必須です。";
                continue;
            }

            $moveId = $moveIdsByName[$moveName] ?? null;

            if (! $moveId) {
                $errors[] = "{$lineNumber}行目: 技名「{$moveName}」がマスタデータに見つかりません。";
                continue;
            }

            $pokemonRankKey = implode('|', [$rule, $pokemonKey, $formKey]);
            $uniqueKey = implode('|', [$pokemonRankKey, $moveId]);

            if (isset($seenKeys[$uniqueKey])) {
                continue;
            }

            $seenKeys[$uniqueKey] = true;
            $rules[$rule] = true;
            $rankByPokemon[$pokemonRankKey] = ($rankByPokemon[$pokemonRankKey] ?? 0) + 1;

            $rows[] = [
                'rule' => $rule,
                'pokemon_key' => $pokemonKey,
                'form_key' => $formKey,
                'move_id' => $moveId,
                'usage_rank' => $rankByPokemon[$pokemonRankKey],
                'memo' => $memo !== '' ? $memo : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        fclose($handle);

        if ($errors !== []) {
            throw new RuntimeException(implode(PHP_EOL, array_slice($errors, 0, 20)));
        }

        DB::transaction(function () use ($rows, $rules): void {
            PokemonCommonMove::query()
                ->whereIn('rule', array_keys($rules))
                ->delete();

            foreach (array_chunk($rows, 500) as $chunk) {
                PokemonCommonMove::query()
                    ->insert($chunk);
            }
        });
    }
}
