<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreNewPartyVersionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'change_note'               => 'nullable|string',

            'pokemon'                   => 'required|array|size:6',

            'pokemon.*.pokemon_key'     => 'required|string|max:255',
            'pokemon.*.form_key'        => 'required|string|max:255',

            'pokemon.*.nickname'        => 'nullable|string|max:255',
            'pokemon.*.item'            => 'nullable|string|max:255',
            'pokemon.*.ability'         => 'nullable|string|max:255',
            'pokemon.*.nature'          => 'nullable|string|max:255',

            'pokemon.*.move_1'          => 'nullable|string|max:255',
            'pokemon.*.move_1_type'     => 'nullable|string|max:50',
            'pokemon.*.move_2'          => 'nullable|string|max:255',
            'pokemon.*.move_2_type'     => 'nullable|string|max:50',
            'pokemon.*.move_3'          => 'nullable|string|max:255',
            'pokemon.*.move_3_type'     => 'nullable|string|max:50',
            'pokemon.*.move_4'          => 'nullable|string|max:255',
            'pokemon.*.move_4_type'     => 'nullable|string|max:50',

            'pokemon.*.memo'            => 'nullable|string',

            'pokemon.*.ev_h'            => 'nullable|integer|min:0',
            'pokemon.*.ev_a'            => 'nullable|integer|min:0',
            'pokemon.*.ev_b'            => 'nullable|integer|min:0',
            'pokemon.*.ev_c'            => 'nullable|integer|min:0',
            'pokemon.*.ev_d'            => 'nullable|integer|min:0',
            'pokemon.*.ev_s'            => 'nullable|integer|min:0',

            'pokemon.*.role_tag_ids'    => 'nullable|array',
            'pokemon.*.role_tag_ids.*'  => 'integer|exists:role_tags,id',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $partyVersion = $this->route('partyVersion');

            if (! $partyVersion) {
                return;
            }

            $pokemonList = $this->input('pokemon', []);

            $pokemonKeys = collect($pokemonList)
                ->map(fn($pokemon) => ($pokemon['pokemon_key'] ?? '') . ':' . ($pokemon['form_key'] ?? 'default'))
                ->filter();

            if ($pokemonKeys->count() !== $pokemonKeys->unique()->count()) {
                $validator->errors()->add(
                    'pokemon',
                    '同じポケモンは同じパーティに登録できません。'
                );
            }

            $items = collect($pokemonList)
                ->pluck('item')
                ->filter(fn($item) => filled($item))
                ->map(fn($item) => trim($item));

            if ($items->count() !== $items->unique()->count()) {
                $validator->errors()->add(
                    'pokemon',
                    '同じ持ち物は同じパーティに登録できません。'
                );
            }

            $party = $partyVersion->party;

            $rule = $party->rule ?: 'main_series';

            $battleRule = config("battle_rules.{$rule}");

            if (! $battleRule) {
                $battleRule = config('battle_rules.main_series');
            }

            $totalLimit = $battleRule['ev_total_limit'];
            $singleLimit = $battleRule['ev_single_limit'];

            foreach ($pokemonList as $index => $pokemon) {
                $effortValues = [
                    (int) ($pokemon['ev_h'] ?? 0),
                    (int) ($pokemon['ev_a'] ?? 0),
                    (int) ($pokemon['ev_b'] ?? 0),
                    (int) ($pokemon['ev_c'] ?? 0),
                    (int) ($pokemon['ev_d'] ?? 0),
                    (int) ($pokemon['ev_s'] ?? 0),
                ];

                foreach ($effortValues as $effortValue) {
                    if ($effortValue > $singleLimit) {
                        $validator->errors()->add(
                            "pokemon.{$index}",
                            "努力値は1項目{$singleLimit}までです。"
                        );

                        break;
                    }
                }

                $total = array_sum($effortValues);

                if ($total > $totalLimit) {
                    $validator->errors()->add(
                        "pokemon.{$index}",
                        "努力値の合計は{$totalLimit}までです。"
                    );
                }
            }
        });

        foreach ($this->input('pokemon', []) as $index => $pokemon) {
            $moves = collect([
                $pokemon['move_1'] ?? null,
                $pokemon['move_2'] ?? null,
                $pokemon['move_3'] ?? null,
                $pokemon['move_4'] ?? null,
            ])
                ->map(fn($move) => trim((string) $move))
                ->filter()
                ->values();

            if ($moves->unique()->count() !== $moves->count()) {
                $validator->errors()->add(
                    "pokemon.{$index}.moves",
                    '同じポケモンに同じ技を複数登録することはできません。'
                );
            }
        }
    }
}
