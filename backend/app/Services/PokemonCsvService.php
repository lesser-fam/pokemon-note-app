<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class PokemonCsvService
{
    public function all(): array
    {
        $path = storage_path('app/data/pokemon.csv');

        if (! file_exists($path)) {
            return [];
        }

        $csv = file_get_contents($path);

        if($csv=== false){
            return[];
        }

        $lines = preg_split("/\r\n|\n|\r/", trim($csv));

        if ($lines === false || count($lines) <= 1) {
            return [];
        }

        $header = str_getcsv(array_shift($lines));

        return collect($lines)
            ->filter(fn ($line) => trim($line) !== '')
            ->map(function ($line) use ($header) {
                $row = array_combine($header, str_getcsv($line));

                return [
                    'key' => $row['key'],
                    'form_key' => $row['form_key'],
                    'name' => $row['name'],
                    'kana' => $row['kana'],
                    'types' => array_values(array_filter([
                        $row['type1'] ?? null,
                        $row['type2'] ?? null,
                    ])),
                    'base_stats' => [
                        'h' => (int) $row['h'],
                        'a' => (int) $row['a'],
                        'b' => (int) $row['b'],
                        'c' => (int) $row['c'],
                        'd' => (int) $row['d'],
                        's' => (int) $row['s'],
                    ],
                    'image_url' => $row['image_url'] ?: null,
                ];
            })
            ->values()
            ->all();
    }
}