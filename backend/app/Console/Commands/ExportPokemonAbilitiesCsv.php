<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class ExportPokemonAbilitiesCsv extends Command
{
    protected $signature = 'pokemon:export-abilities-csv
                            {--output=pokemon_abilities.csv : 出力ファイル名}';

    protected $description =
    '現在のポケモンCSVに含まれる全フォームの特性候補をPokéAPIから取得します。';

    /**
     * PokéAPIの特性名を何度も取得しないための簡易キャッシュ
     *
     * @var array<string, array{
     *     name:string,
     *     description:string|null
     * }>
     */
    private array $abilityDataCache = [];

    public function handle(): int
    {
        $pokemonCsvPath =
            storage_path('app/data/pokemon.csv');

        if (! file_exists($pokemonCsvPath)) {
            $this->error(
                'pokemon.csv が見つかりません。'
            );

            return self::FAILURE;
        }

        $allowedPokemonPairs =
            $this->loadAllowedPokemonPairs(
                $pokemonCsvPath,
            );

        if ($allowedPokemonPairs === []) {
            $this->error(
                'pokemon.csv にポケモンが登録されていません。'
            );

            return self::FAILURE;
        }

        $nationalDexNumbers = collect(
            array_values($allowedPokemonPairs),
        )
            ->pluck('national_dex_number')
            ->unique()
            ->sort()
            ->values();

        $output = basename(
            (string) $this->option('output'),
        );

        $outputPath =
            storage_path("app/data/{$output}");

        $handle = fopen($outputPath, 'w');

        if ($handle === false) {
            $this->error(
                "CSVファイルを作成できませんでした: {$outputPath}"
            );

            return self::FAILURE;
        }

        fputcsv($handle, [
            'pokemon_key',
            'form_key',
            'ability_key',
            'ability_name',
            'ability_description',
            'is_hidden',
            'slot',
        ]);

        $this->info(
            'ポケモンと特性の紐付けを取得します。'
        );

        $progressBar =
            $this->output->createProgressBar(
                $nationalDexNumbers->count(),
            );

        $progressBar->start();

        $writtenRows = [];

        try {
            foreach ($nationalDexNumbers as $nationalDexNumber) {
                $species = $this->fetchJson(
                    "https://pokeapi.co/api/v2/pokemon-species/{$nationalDexNumber}/",
                );

                foreach (
                    $species['varieties'] ?? []
                    as $variety
                ) {
                    $pokemonUrl =
                        $variety['pokemon']['url']
                        ?? null;

                    if (! is_string($pokemonUrl)) {
                        continue;
                    }

                    $pokemon = $this->fetchJson(
                        $pokemonUrl,
                    );

                    $speciesKey =
                        (string) ($species['name'] ?? '');

                    $pokeApiPokemonKey =
                        (string) ($pokemon['name'] ?? '');

                    $formKey = $this->getFormKey(
                        speciesKey: $speciesKey,
                        pokemonKey: $pokeApiPokemonKey,
                        isDefault: (bool) (
                            $variety['is_default']
                            ?? false
                        ),
                    );

                    $pairKey =
                        "{$speciesKey}:{$formKey}";

                    /*
                     * pokemon.csv に含まれないフォームは除外します。
                     *
                     * これにより、pokemon.csv側で除外した特殊フォームが
                     * 特性CSVにだけ混ざることを防ぎます。
                     */
                    if (
                        ! array_key_exists(
                            $pairKey,
                            $allowedPokemonPairs,
                        )
                    ) {
                        continue;
                    }

                    foreach (
                        $pokemon['abilities'] ?? []
                        as $pokemonAbility
                    ) {
                        $abilityKey =
                            (string) (
                                $pokemonAbility['ability']['name']
                                ?? ''
                            );

                        $abilityUrl =
                            (string) (
                                $pokemonAbility['ability']['url']
                                ?? ''
                            );

                        if (
                            $abilityKey === ''
                            || $abilityUrl === ''
                        ) {
                            continue;
                        }

                        $isHidden =
                            (bool) (
                                $pokemonAbility['is_hidden']
                                ?? false
                            );

                        $slot =
                            (int) (
                                $pokemonAbility['slot']
                                ?? 0
                            );

                        $rowKey = implode(':', [
                            $speciesKey,
                            $formKey,
                            $abilityKey,
                        ]);

                        if (
                            isset(
                                $writtenRows[$rowKey],
                            )
                        ) {
                            continue;
                        }

                        $abilityData =
                            $this->getAbilityData(
                                abilityKey: $abilityKey,
                                abilityUrl: $abilityUrl,
                            );

                        fputcsv($handle, [
                            $speciesKey,
                            $formKey,
                            $abilityKey,
                            $abilityData['name'],
                            $abilityData['description'],
                            $isHidden ? 1 : 0,
                            $slot,
                        ]);

                        $writtenRows[$rowKey] = true;
                    }

                    /*
                     * PokéAPIへ短時間で大量アクセスしないように、
                     * リクエスト間隔を少し空けます。
                     */
                    usleep(100000);
                }

                $progressBar->advance();
            }
        } catch (Throwable $exception) {
            fclose($handle);

            $progressBar->finish();
            $this->newLine(2);

            $this->error(
                'CSV生成に失敗しました: '
                    . $exception->getMessage(),
            );

            return self::FAILURE;
        }

        fclose($handle);

        $progressBar->finish();
        $this->newLine(2);

        $this->info(
            "CSVを生成しました: {$outputPath}"
        );

        $this->info(
            '登録件数: '
                . count($writtenRows)
        );

        return self::SUCCESS;
    }

    /**
     * pokemon.csvに登録済みのフォームだけを許可します。
     *
     * @return array<string, array{
     *     national_dex_number: int,
     *     pokemon_key: string,
     *     form_key: string
     * }>
     */
    private function loadAllowedPokemonPairs(
        string $path,
    ): array {
        $csv = file_get_contents($path);

        if ($csv === false) {
            return [];
        }

        $lines = preg_split(
            "/\r\n|\n|\r/",
            trim($csv),
        );

        if (
            $lines === false
            || count($lines) <= 1
        ) {
            return [];
        }

        $header = str_getcsv(
            array_shift($lines),
        );

        return collect($lines)
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
                    return [];
                }

                return [
                    'national_dex_number' =>
                    (int) (
                        $row['national_dex_number']
                        ?? 0
                    ),
                    'pokemon_key' =>
                    (string) (
                        $row['key']
                        ?? ''
                    ),
                    'form_key' =>
                    (string) (
                        $row['form_key']
                        ?? 'default'
                    ),
                ];
            })
            ->filter(
                fn(array $pokemon): bool =>
                $pokemon['national_dex_number'] > 0
                    && $pokemon['pokemon_key'] !== '',
            )
            ->mapWithKeys(
                fn(array $pokemon): array => [
                    "{$pokemon['pokemon_key']}:{$pokemon['form_key']}"
                    => $pokemon,
                ],
            )
            ->all();
    }

    /**
     * @return array{
     *     name: string,
     *     description: string|null
     * }
     */
    private function getAbilityData(
        string $abilityKey,
        string $abilityUrl,
    ): array {
        if (
            isset(
                $this->abilityDataCache[$abilityKey],
            )
        ) {
            return $this->abilityDataCache[$abilityKey];
        }

        $ability = $this->fetchJson(
            $abilityUrl,
        );

        $japaneseName = collect(
            $ability['names'] ?? [],
        )
            ->first(
                fn(array $name): bool =>
                in_array(
                    $name['language']['name']
                        ?? '',
                    [
                        'ja',
                        'ja-Hrkt',
                    ],
                    true,
                ),
            );

        /*
     * 同じ特性でも複数世代の説明が存在する場合があります。
     * 最後に登録されている日本語説明を採用します。
     */
        $japaneseDescription = collect(
            $ability['flavor_text_entries']
                ?? [],
        )
            ->filter(
                fn(array $entry): bool =>
                in_array(
                    $entry['language']['name']
                        ?? '',
                    [
                        'ja',
                        'ja-Hrkt',
                    ],
                    true,
                ),
            )
            ->last();

        $description =
            $this->normalizeDescription(
                $japaneseDescription['flavor_text']
                    ?? null,
            );

        $abilityData = [
            'name' =>
            (string) (
                $japaneseName['name']
                ?? $abilityKey
            ),
            'description' => $description,
        ];

        $this->abilityDataCache[$abilityKey] = $abilityData;

        return $abilityData;
    }

    private function normalizeDescription(
        mixed $description,
    ): ?string {
        if (! is_string($description)) {
            return null;
        }

        /*
     * API内の改行や改ページ文字を、
     * ホバー表示しやすい空白へそろえます。
     */
        $normalized = preg_replace(
            '/[\r\n\f]+/u',
            ' ',
            $description,
        );

        if (! is_string($normalized)) {
            return null;
        }

        $normalized = preg_replace(
            '/\s+/u',
            ' ',
            trim($normalized),
        );

        if (
            ! is_string($normalized)
            || $normalized === ''
        ) {
            return null;
        }

        return $normalized;
    }

    private function fetchJson(
        string $url,
    ): array {
        $response = Http::timeout(15)
            ->connectTimeout(5)
            ->retry(3, 300)
            ->get($url);

        if (! $response->successful()) {
            throw new RuntimeException(
                "PokéAPIの取得に失敗しました: {$url}"
            );
        }

        return $response->json();
    }

    private function getFormKey(
        string $speciesKey,
        string $pokemonKey,
        bool $isDefault,
    ): string {
        if (
            $isDefault
            || $pokemonKey === $speciesKey
        ) {
            return 'default';
        }

        $prefix = "{$speciesKey}-";

        if (
            str_starts_with(
                $pokemonKey,
                $prefix,
            )
        ) {
            return substr(
                $pokemonKey,
                strlen($prefix),
            );
        }

        return $pokemonKey;
    }
}
