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
            'pokemon.*.move_2'          => 'nullable|string|max:255',
            'pokemon.*.move_3'          => 'nullable|string|max:255',
            'pokemon.*.move_4'          => 'nullable|string|max:255',

            'pokemon.*.memo'            => 'nullable|string',

            'pokemon.*.role_tag_ids'    => 'nullable|array',
            'pokemon.*.role_tag_ids.*'  => 'integer|exists:role_tags,id',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
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
        });
    }
}
