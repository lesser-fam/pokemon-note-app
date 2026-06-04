<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class ExportPokemonCsv extends Command
{
    protected $signature = 'pokemon:export-csv
                            {--from=1 : 開始する全国図鑑番号}
                            {--to=151 : 終了する全国図鑑番号}
                            {--output=pokemon.generated.csv : 出力ファイル名}';

    protected $description =
    'PokéAPIから全国図鑑順のポケモンCSVを生成します。';

    /**
     * 英語タイプ名と日本語タイプ名の対応表
     */
    private const TYPE_LABELS = [
        'normal' => 'ノーマル',
        'fire' => 'ほのお',
        'water' => 'みず',
        'electric' => 'でんき',
        'grass' => 'くさ',
        'ice' => 'こおり',
        'fighting' => 'かくとう',
        'poison' => 'どく',
        'ground' => 'じめん',
        'flying' => 'ひこう',
        'psychic' => 'エスパー',
        'bug' => 'むし',
        'rock' => 'いわ',
        'ghost' => 'ゴースト',
        'dragon' => 'ドラゴン',
        'dark' => 'あく',
        'steel' => 'はがね',
        'fairy' => 'フェアリー',
    ];

    /**
     * 対戦前の候補として表示しないフォーム名の一部
     */
    private const EXCLUDED_FORM_PATTERNS = [
        // '-mega',
        '-gmax',
        '-totem',
        '-starter',
        '-partner',
        '-cap',
        '-cosplay',
        '-belle',
        '-libre',
        '-phd',
        '-pop-star',
        '-rock-star',
        '-eternamax',
    ];

    /**
     * よく使うフォーム名の表示ラベル
     *
     * 未登録フォームは、英語のform_keyをそのまま表示します。
     * 後から必要に応じて追加できます。
     */
    private const FORM_LABELS = [
        'alola' => 'アローラのすがた',
        'galar' => 'ガラルのすがた',
        'hisui' => 'ヒスイのすがた',
        'paldea' => 'パルデアのすがた',

        'mega' => 'メガシンカ',
        'mega-x' => 'メガシンカX',
        'mega-y' => 'メガシンカY',
        'gmax' => 'キョダイマックス',

        'heat' => 'ヒート',
        'wash' => 'ウォッシュ',
        'frost' => 'フロスト',
        'fan' => 'スピン',
        'mow' => 'カット',
    ];

    public function handle(): int
    {
        $from = (int) $this->option('from');
        $to = (int) $this->option('to');
        $output = basename((string) $this->option('output'));

        if ($from < 1 || $to < $from) {
            $this->error(
                '--from と --to の指定が正しくありません。',
            );

            return self::FAILURE;
        }

        $outputPath = storage_path("app/data/{$output}");

        if (! is_dir(dirname($outputPath))) {
            mkdir(
                dirname($outputPath),
                0755,
                true,
            );
        }

        $handle = fopen($outputPath, 'w');

        if ($handle === false) {
            $this->error(
                "CSVファイルを作成できませんでした: {$outputPath}",
            );

            return self::FAILURE;
        }

        fputcsv($handle, [
            'national_dex_number',
            'form_order',
            'key',
            'form_key',
            'name',
            'kana',
            'type1',
            'type2',
            'h',
            'a',
            'b',
            'c',
            'd',
            's',
            'image_url',
        ]);

        $this->info(
            "全国図鑑 No.{$from}〜{$to} を取得します。",
        );

        $progressBar = $this->output->createProgressBar(
            $to - $from + 1,
        );

        $progressBar->start();

        try {
            for (
                $nationalDexNumber = $from;
                $nationalDexNumber <= $to;
                $nationalDexNumber++
            ) {
                $species = $this->fetchJson(
                    "https://pokeapi.co/api/v2/pokemon-species/{$nationalDexNumber}/",
                );

                $varieties = collect(
                    $species['varieties'] ?? [],
                )
                    ->filter(
                        fn(array $variety): bool =>
                        ! $this->shouldExcludeVariety(
                            (string) data_get(
                                $variety,
                                'pokemon.name',
                                '',
                            ),
                        ),
                    )
                    ->sortByDesc(
                        fn(array $variety): bool =>
                        (bool) ($variety['is_default'] ?? false),
                    )
                    ->values();

                foreach ($varieties as $formOrder => $variety) {
                    $pokemon = $this->fetchJson(
                        $variety['pokemon']['url'],
                    );

                    fputcsv(
                        $handle,
                        $this->createCsvRow(
                            nationalDexNumber: $nationalDexNumber,
                            formOrder: $formOrder,
                            species: $species,
                            pokemon: $pokemon,
                        ),
                    );

                    /*
                     * PokéAPIへ短時間で大量アクセスしないため、
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
                "CSV生成に失敗しました: {$exception->getMessage()}",
            );

            return self::FAILURE;
        }

        fclose($handle);

        $progressBar->finish();
        $this->newLine(2);

        $this->info(
            "CSVを生成しました: {$outputPath}",
        );

        return self::SUCCESS;
    }

    private function fetchJson(string $url): array
    {
        $response = Http::timeout(15)
            ->connectTimeout(5)
            ->retry(3, 300)
            ->get($url);

        if (! $response->successful()) {
            throw new RuntimeException(
                "PokéAPIの取得に失敗しました: {$url}",
            );
        }

        return $response->json();
    }

    private function createCsvRow(
        int $nationalDexNumber,
        int $formOrder,
        array $species,
        array $pokemon,
    ): array {
        $speciesKey = (string) $species['name'];

        $formKey = $this->getFormKey(
            speciesKey: $speciesKey,
            pokemonKey: (string) $pokemon['name'],
            isDefault: (bool) ($pokemon['is_default'] ?? false),
        );

        $baseName = $this->getJapaneseName(
            names: $species['names'] ?? [],
            fallback: $speciesKey,
        );

        $displayName = $this->getDisplayName(
            baseName: $baseName,
            formKey: $formKey,
        );

        $types = collect($pokemon['types'] ?? [])
            ->sortBy('slot')
            ->pluck('type.name')
            ->map(
                fn(string $type): string =>
                self::TYPE_LABELS[$type] ?? $type,
            )
            ->values();

        $stats = collect($pokemon['stats'] ?? [])
            ->mapWithKeys(
                fn(array $stat): array => [
                    $stat['stat']['name'] =>
                    (int) $stat['base_stat'],
                ],
            );

        return [
            $nationalDexNumber,
            $formOrder,
            $speciesKey,
            $formKey,
            $displayName,
            mb_convert_kana(
                $displayName,
                'c',
                'UTF-8',
            ),
            $types->get(0),
            $types->get(1),
            $stats->get('hp', 0),
            $stats->get('attack', 0),
            $stats->get('defense', 0),
            $stats->get('special-attack', 0),
            $stats->get('special-defense', 0),
            $stats->get('speed', 0),
            data_get(
                $pokemon,
                'sprites.front_default',
            ),
        ];
    }

    private function getJapaneseName(
        array $names,
        string $fallback,
    ): string {
        $japaneseName = collect($names)
            ->first(
                fn(array $name): bool =>
                in_array(
                    strtolower(
                        (string) $name['language']['name'],
                    ),
                    [
                        'ja',
                        'ja-hrkt',
                    ],
                    true,
                ),
            );

        return (string) (
            $japaneseName['name']
            ?? $fallback
        );
    }

    private function getFormKey(
        string $speciesKey,
        string $pokemonKey,
        bool $isDefault,
    ): string {
        if ($isDefault || $pokemonKey === $speciesKey) {
            return 'default';
        }

        $prefix = "{$speciesKey}-";

        if (str_starts_with($pokemonKey, $prefix)) {
            return substr(
                $pokemonKey,
                strlen($prefix),
            );
        }

        return $pokemonKey;
    }

    private function getDisplayName(
        string $baseName,
        string $formKey,
    ): string {
        if ($formKey === 'default') {
            return $baseName;
        }

        $formLabel =
            self::FORM_LABELS[$formKey]
            ?? $formKey;

        return "{$baseName}（{$formLabel}）";
    }

    private function shouldExcludeVariety(
        string $pokemonKey,
    ): bool {
        foreach (self::EXCLUDED_FORM_PATTERNS as $pattern) {
            if (str_contains($pokemonKey, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
