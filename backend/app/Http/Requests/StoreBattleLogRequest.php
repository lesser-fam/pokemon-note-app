<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBattleLogRequest extends FormRequest
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
            'result'                        => 'required|string|in:win,lose',

            'opponent_pokemon_1'            => 'nullable|string|max:255',
            'opponent_form_1'               => 'nullable|string|max:255',

            'opponent_pokemon_2'            => 'nullable|string|max:255',
            'opponent_form_2'               => 'nullable|string|max:255',

            'opponent_pokemon_3'            => 'nullable|string|max:255',
            'opponent_form_3'               => 'nullable|string|max:255',

            'opponent_pokemon_4'            => 'nullable|string|max:255',
            'opponent_form_4'               => 'nullable|string|max:255',

            'opponent_pokemon_5'            => 'nullable|string|max:255',
            'opponent_form_5'               => 'nullable|string|max:255',

            'opponent_pokemon_6'            => 'nullable|string|max:255',
            'opponent_form_6'               => 'nullable|string|max:255',

            'selected_pokemon_1_id'         => 'nullable|integer|distinct|exists:party_pokemon,id',
            'selected_pokemon_2_id'         => 'nullable|integer|distinct|exists:party_pokemon,id',
            'selected_pokemon_3_id'         => 'nullable|integer|distinct|exists:party_pokemon,id',

            'selected_opponent_pokemon_1'   => 'nullable|string|max:255',
            'selected_opponent_form_1'      => 'nullable|string|max:255',

            'selected_opponent_pokemon_2'   => 'nullable|string|max:255',
            'selected_opponent_form_2'      => 'nullable|string|max:255',

            'selected_opponent_pokemon_3'   => 'nullable|string|max:255',
            'selected_opponent_form_3'      => 'nullable|string|max:255',

            'heavy_opponent_key'            => 'nullable|string|max:255',
            'heavy_opponent_form'           => 'nullable|string|max:255',

            'needed_pokemon_id'             => 'nullable|integer|exists:party_pokemon,id',

            'loss_tags'                     => 'nullable|array',
            'loss_tags.*'                   => 'string|max:255',

            'reflection'                    => 'nullable|string',
            'next_note'                     => 'nullable|string',
        ];
    }
}
