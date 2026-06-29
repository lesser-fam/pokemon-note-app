<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupMasterData extends Command
{
    protected $signature = 'app:setup-master-data
                            {--from=1 : Pokemon national dex number to start from}
                            {--to=1025 : Pokemon national dex number to end at}
                            {--limit=0 : Maximum move, ability, and item records per resource. 0 imports all records}
                            {--skip-pokemon : Skip pokemon.csv generation}
                            {--skip-battle-master : Skip move, ability, and item import}
                            {--skip-abilities-csv : Skip pokemon_abilities.csv generation}
                            {--skip-seed : Skip database seeders}';

    protected $description = 'Setup Pokemon, move, ability, item, and related master data for local development.';

    public function handle(): int
    {
        if (! $this->option('skip-pokemon')) {
            $result = $this->call('pokemon:export-csv', [
                '--from' => (int) $this->option('from'),
                '--to' => (int) $this->option('to'),
                '--output' => 'pokemon.csv',
            ]);

            if ($result !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        if (! $this->option('skip-battle-master')) {
            $result = $this->call('app:import-battle-master-data', [
                'resource' => 'all',
                '--limit' => (int) $this->option('limit'),
            ]);

            if ($result !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        if (! $this->option('skip-abilities-csv')) {
            $result = $this->call('pokemon:export-abilities-csv', [
                '--output' => 'pokemon_abilities.csv',
            ]);

            if ($result !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        if (! $this->option('skip-seed')) {
            $result = $this->call('db:seed');

            if ($result !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        $this->newLine();
        $this->info('マスターデータのセットアップが完了しました。');

        return self::SUCCESS;
    }
}