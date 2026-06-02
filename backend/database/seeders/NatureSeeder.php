<?php

namespace Database\Seeders;

use App\Models\Nature;
use Illuminate\Database\Seeder;

class NatureSeeder extends Seeder
{
    public function run(): void
    {
        $natures = [
            [
                'key' => 'hardy',
                'name' => 'がんばりや',
                'increased_stat' => null,
                'decreased_stat' => null,
            ],
            [
                'key' => 'lonely',
                'name' => 'さみしがり',
                'increased_stat' => 'a',
                'decreased_stat' => 'b',
            ],
            [
                'key' => 'brave',
                'name' => 'ゆうかん',
                'increased_stat' => 'a',
                'decreased_stat' => 's',
            ],
            [
                'key' => 'adamant',
                'name' => 'いじっぱり',
                'increased_stat' => 'a',
                'decreased_stat' => 'c',
            ],
            [
                'key' => 'naughty',
                'name' => 'やんちゃ',
                'increased_stat' => 'a',
                'decreased_stat' => 'd',
            ],
            [
                'key' => 'bold',
                'name' => 'ずぶとい',
                'increased_stat' => 'b',
                'decreased_stat' => 'a',
            ],
            [
                'key' => 'docile',
                'name' => 'すなお',
                'increased_stat' => null,
                'decreased_stat' => null,
            ],
            [
                'key' => 'relaxed',
                'name' => 'のんき',
                'increased_stat' => 'b',
                'decreased_stat' => 's',
            ],
            [
                'key' => 'impish',
                'name' => 'わんぱく',
                'increased_stat' => 'b',
                'decreased_stat' => 'c',
            ],
            [
                'key' => 'lax',
                'name' => 'のうてんき',
                'increased_stat' => 'b',
                'decreased_stat' => 'd',
            ],
            [
                'key' => 'timid',
                'name' => 'おくびょう',
                'increased_stat' => 's',
                'decreased_stat' => 'a',
            ],
            [
                'key' => 'hasty',
                'name' => 'せっかち',
                'increased_stat' => 's',
                'decreased_stat' => 'b',
            ],
            [
                'key' => 'serious',
                'name' => 'まじめ',
                'increased_stat' => null,
                'decreased_stat' => null,
            ],
            [
                'key' => 'jolly',
                'name' => 'ようき',
                'increased_stat' => 's',
                'decreased_stat' => 'c',
            ],
            [
                'key' => 'naive',
                'name' => 'むじゃき',
                'increased_stat' => 's',
                'decreased_stat' => 'd',
            ],
            [
                'key' => 'modest',
                'name' => 'ひかえめ',
                'increased_stat' => 'c',
                'decreased_stat' => 'a',
            ],
            [
                'key' => 'mild',
                'name' => 'おっとり',
                'increased_stat' => 'c',
                'decreased_stat' => 'b',
            ],
            [
                'key' => 'quiet',
                'name' => 'れいせい',
                'increased_stat' => 'c',
                'decreased_stat' => 's',
            ],
            [
                'key' => 'bashful',
                'name' => 'てれや',
                'increased_stat' => null,
                'decreased_stat' => null,
            ],
            [
                'key' => 'rash',
                'name' => 'うっかりや',
                'increased_stat' => 'c',
                'decreased_stat' => 'd',
            ],
            [
                'key' => 'calm',
                'name' => 'おだやか',
                'increased_stat' => 'd',
                'decreased_stat' => 'a',
            ],
            [
                'key' => 'gentle',
                'name' => 'おとなしい',
                'increased_stat' => 'd',
                'decreased_stat' => 'b',
            ],
            [
                'key' => 'sassy',
                'name' => 'なまいき',
                'increased_stat' => 'd',
                'decreased_stat' => 's',
            ],
            [
                'key' => 'careful',
                'name' => 'しんちょう',
                'increased_stat' => 'd',
                'decreased_stat' => 'c',
            ],
            [
                'key' => 'quirky',
                'name' => 'きまぐれ',
                'increased_stat' => null,
                'decreased_stat' => null,
            ],
        ];

        foreach ($natures as $nature) {
            Nature::updateOrCreate(
                [
                    'key' => $nature['key'],
                ],
                $nature,
            );
        }
    }
}
