<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'pokemon_key' => ['required', 'string', 'max:255'],
            'form_key' => ['required', 'string', 'max:255'],

            'nickname' => ['nullable', 'string', 'max:255'],
            'item' => ['nullable', 'string', 'max:255'],
            'ability' => ['nullable', 'string', 'max:255'],
            'nature' => ['nullable', 'string', 'max:255'],

            'move_1' => ['nullable', 'string', 'max:255'],
            'move_2' => ['nullable', 'string', 'max:255'],
            'move_3' => ['nullable', 'string', 'max:255'],
            'move_4' => ['nullable', 'string', 'max:255'],

            'memo' => ['nullable', 'string'],

            'role_tag_ids' => ['nullable', 'array'],
            'role_tag_ids.*' => ['integer', 'exists:role_tags,id'],
        ];
    }
}
