<?php

namespace App\Support;

class KanaSearch
{
    public static function matches(string $value, string $keyword): bool
    {
        $normalizedValue = self::normalize($value);
        $normalizedKeyword = self::normalize($keyword);

        if ($normalizedKeyword === '') {
            return true;
        }

        return str_contains($normalizedValue, $normalizedKeyword);
    }

    private static function normalize(string $value): string
    {
        return mb_strtolower(
            mb_convert_kana(trim($value), 'asC', 'UTF-8'),
            'UTF-8',
        );
    }
}
