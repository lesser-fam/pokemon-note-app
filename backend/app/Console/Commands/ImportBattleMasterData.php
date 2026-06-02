<?php

namespace App\Console\Commands;

use App\Models\Ability;
use App\Models\Item;
use App\Models\Move;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class ImportBattleMasterData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * resource:
     * - moves
     * - abilities
     * - items
     * - all
     *
     * --limit:
     * - 0: 全件
     * - 10: 最初の10件だけ
     */
    protected $signature = 'app:import-battle-master-data
                            {resource=all : moves, abilities, items, or all}
                            {--limit=0 : Maximum number of records per resource. 0 imports all records}';

    /**
     * The console command description.
     */
    protected $description = 'Import move, ability, and item master data from PokéAPI';

    /**
     * PokéAPIの基準URL。
     */
    private const BASE_URL = 'https://pokeapi.co/api/v2';

    /**
     * PokéAPI側の英語タイプ名を、アプリ内で使っている日本語へ変換する。
     */
    private const TYPE_NAME_MAP = [
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
     * Execute the console command.
     */
    public function handle(): int
    {
        $resource = (string) $this->argument('resource');

        if (! in_array($resource, ['moves', 'abilities', 'items', 'all'], true)) {
            $this->error(
                'resourceには moves、abilities、items、all のいずれかを指定してください。',
            );

            return self::FAILURE;
        }

        if ($resource === 'moves' || $resource === 'all') {
            $this->importMoves();
        }

        if ($resource === 'abilities' || $resource === 'all') {
            $this->importAbilities();
        }

        if ($resource === 'items' || $resource === 'all') {
            $this->importItems();
        }

        $this->newLine();
        $this->info('マスターデータの取り込みが完了しました。');

        return self::SUCCESS;
    }

    /**
     * 技を取り込む。
     */
    private function importMoves(): void
    {
        $this->newLine();
        $this->info('技データを取り込んでいます。');

        $this->importResources('move', function (array $data): void {
            $damageClass = $data['damage_class']['name'] ?? 'status';

            Move::updateOrCreate(
                [
                    'key' => $data['name'],
                ],
                [
                    'name' => $this->getLocalizedName(
                        $data['names'] ?? [],
                        $data['name'],
                    ),
                    'type' => $this->convertTypeName(
                        $data['type']['name'] ?? '',
                    ),
                    'damage_class' => $damageClass,
                    'power' => $data['power'] ?? null,
                    'is_scoring_target' => in_array(
                        $damageClass,
                        ['physical', 'special'],
                        true,
                    ),
                ],
            );
        });
    }

    /**
     * 特性を取り込む。
     */
    private function importAbilities(): void
    {
        $this->newLine();
        $this->info('特性データを取り込んでいます。');

        $this->importResources('ability', function (array $data): void {
            Ability::updateOrCreate(
                [
                    'key' => $data['name'],
                ],
                [
                    'name' => $this->getLocalizedName(
                        $data['names'] ?? [],
                        $data['name'],
                    ),
                ],
            );
        });
    }

    /**
     * 持ち物を取り込む。
     */
    private function importItems(): void
    {
        $this->newLine();
        $this->info('持ち物データを取り込んでいます。');

        $this->importResources('item', function (array $data): void {
            Item::updateOrCreate(
                [
                    'key' => $data['name'],
                ],
                [
                    'name' => $this->getLocalizedName(
                        $data['names'] ?? [],
                        $data['name'],
                    ),
                ],
            );
        });
    }

    /**
     * 一覧取得と、各データの詳細取得を共通化する。
     */
    private function importResources(
        string $endpoint,
        callable $saveResource,
    ): void {
        $resources = $this->fetchResourceList($endpoint);
        $limit = max((int) $this->option('limit'), 0);

        if ($limit > 0) {
            $resources = array_slice($resources, 0, $limit);
        }

        $successCount = 0;
        $failureCount = 0;

        $progressBar = $this->output->createProgressBar(count($resources));
        $progressBar->start();

        foreach ($resources as $resource) {
            try {
                $data = $this->request($resource['url']);

                $saveResource($data);

                $successCount++;
            } catch (Throwable $exception) {
                $failureCount++;

                $this->newLine();
                $this->warn(
                    "{$resource['name']} の取り込みに失敗しました: {$exception->getMessage()}",
                );
            }

            $progressBar->advance();

            // APIへ短時間で大量アクセスしすぎないように少し間隔を空ける。
            usleep(50_000);
        }

        $progressBar->finish();

        $this->newLine(2);
        $this->info("成功: {$successCount}件");
        $this->info("失敗: {$failureCount}件");
    }

    /**
     * 一覧を取得する。
     */
    private function fetchResourceList(string $endpoint): array
    {
        $data = $this->request(
            self::BASE_URL . "/{$endpoint}/",
            [
                'limit' => 100_000,
            ],
        );

        return $data['results'] ?? [];
    }

    /**
     * PokéAPIへGETリクエストを送る。
     */
    private function request(string $url, array $query = []): array
    {
        return Http::connectTimeout(10)
            ->timeout(30)
            ->retry(3, 500)
            ->get($url, $query)
            ->throw()
            ->json();
    }

    /**
     * 日本語名を優先して取得する。
     *
     * 日本語名がなければ、英語名を使う。
     * それもなければAPI上のkeyを使う。
     */
    private function getLocalizedName(array $names, string $fallback): string
    {
        foreach (['ja-Hrkt', 'ja', 'en'] as $languageName) {
            foreach ($names as $nameData) {
                if (($nameData['language']['name'] ?? null) === $languageName) {
                    return $nameData['name'];
                }
            }
        }

        return $fallback;
    }

    /**
     * タイプ名をアプリ用の日本語へ変換する。
     */
    private function convertTypeName(string $typeName): string
    {
        return self::TYPE_NAME_MAP[$typeName] ?? $typeName;
    }
}
