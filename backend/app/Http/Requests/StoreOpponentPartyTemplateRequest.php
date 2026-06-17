<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOpponentPartyTemplateRequest extends FormRequest
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
            'memo'                  => 'nullable|string|max:255',
            'pokemon'               => 'required|array|size:6',
            'pokemon.*.pokemon_key' => 'required|string|max:255|distinct',
            'pokemon.*.form_key'    => 'required|string|max:255',

        ];
    }

    public function messages(): array
    {
        return [
            'memo.max'                          => 'メモは255文字以内で入力してください。',

            'pokemon.required'                  => 'ポケモンを6匹選択してください。',
            'pokemon.array'                     => 'ポケモンの形式が正しくありません。',
            'pokemon.size'                      => 'ポケモンは6匹選択してください。',

            'pokemon.*.pokemon_key.required'    => 'ポケモンの識別情報がありません。',
            'pokemon.*.pokemon_key.distinct'    => '同じポケモンを重複して登録することはできません。',

            'pokemon.*.form_key.required'       => 'ポケモンのフォーム情報がありません。',
        ];
    }

    public function attributes(): array
    {
        return [
            'memo'                  => 'メモ',
            'pokemon'               => 'ポケモン',
            'pokemon.*.pokemon_key' => 'ポケモン',
            'pokemon.*.form_key'    => 'フォーム',
        ];
    }
}
