<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePartyPokemonRequest extends FormRequest
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
            'pokemon_key'       => 'required|string|max:255',
            'form_key'          => 'required|string|max:255',

            'nickname'          => 'nullable|string|max:255',
            'item'              => 'nullable|string|max:255',
            'ability'           => 'nullable|string|max:255',
            'nature'            => 'nullable|string|max:255',

            'ev_h'              => 'nullable|integer|min:0',
            'ev_a'              => 'nullable|integer|min:0',
            'ev_b'              => 'nullable|integer|min:0',
            'ev_c'              => 'nullable|integer|min:0',
            'ev_d'              => 'nullable|integer|min:0',
            'ev_s'              => 'nullable|integer|min:0',

            'move_1'            => 'nullable|string|max:255',
            'move_1_type'       => 'nullable|string|max:50',
            'move_2'            => 'nullable|string|max:255',
            'move_2_type'       => 'nullable|string|max:50',
            'move_3'            => 'nullable|string|max:255',
            'move_3_type'       => 'nullable|string|max:50',
            'move_4'            => 'nullable|string|max:255',
            'move_4_type'       => 'nullable|string|max:50',

            'memo'              => 'nullable|string',

            'role_tag_ids'      => 'nullable|array',
            'role_tag_ids.*'    => 'integer|exists:role_tags,id',


            // ID保存用追加分
            'item_id'           => 'nullable|integer|exists:items,id',
            'ability_id'        => 'nullable|integer|exists:abilities,id',
            'nature_id'         => 'nullable|integer|exists:natures,id',

            'move_1_id'         => 'nullable|integer|exists:moves,id',
            'move_2_id'         => 'nullable|integer|exists:moves,id',
            'move_3_id'         => 'nullable|integer|exists:moves,id',
            'move_4_id'         => 'nullable|integer|exists:moves,id',

        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $partyVersion = $this->route('partyVersion');

            if (! $partyVersion) {
                return;
            }

            $party = $partyVersion->party;
            $rule = $party->rule ?: 'main_series';

            $battleRule = config("battle_rules.{$rule}") ?? config('battle_rules.main_series');

            $totalLimit = $battleRule['ev_total_limit'];
            $singleLimit = $battleRule['ev_single_limit'];

            $effortValues = [
                (int) ($this->input('ev_h') ?? 0),
                (int) ($this->input('ev_a') ?? 0),
                (int) ($this->input('ev_b') ?? 0),
                (int) ($this->input('ev_c') ?? 0),
                (int) ($this->input('ev_d') ?? 0),
                (int) ($this->input('ev_s') ?? 0),
            ];

            foreach ($effortValues as $effortValue) {
                if ($effortValue > $singleLimit) {
                    $validator->errors()->add(
                        'effort_values',
                        "努力値は1項目{$singleLimit}までです。"
                    );

                    break;
                }
            }

            if (array_sum($effortValues) > $totalLimit) {
                $validator->errors()->add(
                    'effort_values',
                    "努力値の合計は{$totalLimit}までです。"
                );
            }
        });

        $moves = collect([
            $this->input('move_1'),
            $this->input('move_2'),
            $this->input('move_3'),
            $this->input('move_4'),
        ])
            ->map(fn($move) => trim((string) $move))
            ->filter()
            ->values();

        if ($moves->unique()->count() !== $moves->count()) {
            $validator->errors()->add(
                'moves',
                '同じポケモンに同じ技を複数登録することはできません。'
            );
        }
    }
}
