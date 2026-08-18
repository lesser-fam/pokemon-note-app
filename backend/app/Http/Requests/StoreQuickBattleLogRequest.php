<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuickBattleLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'result' => 'required|string|in:win,lose',

            'opponent_pokemon_1' => 'required|string|max:255',
            'opponent_form_1' => 'nullable|string|max:255',
            'opponent_pokemon_2' => 'nullable|string|max:255',
            'opponent_form_2' => 'nullable|string|max:255',
            'opponent_pokemon_3' => 'nullable|string|max:255',
            'opponent_form_3' => 'nullable|string|max:255',
            'opponent_pokemon_4' => 'nullable|string|max:255',
            'opponent_form_4' => 'nullable|string|max:255',
            'opponent_pokemon_5' => 'nullable|string|max:255',
            'opponent_form_5' => 'nullable|string|max:255',
            'opponent_pokemon_6' => 'nullable|string|max:255',
            'opponent_form_6' => 'nullable|string|max:255',

            'selected_pokemon_1_id' => 'required|integer|exists:party_pokemon,id',
            'selected_pokemon_2_id' => 'required|integer|exists:party_pokemon,id',
            'selected_pokemon_3_id' => 'required|integer|exists:party_pokemon,id',

            'selected_opponent_pokemon_1' => 'required|string|max:255',
            'selected_opponent_form_1' => 'nullable|string|max:255',
            'selected_opponent_pokemon_2' => 'nullable|string|max:255',
            'selected_opponent_form_2' => 'nullable|string|max:255',
            'selected_opponent_pokemon_3' => 'nullable|string|max:255',
            'selected_opponent_form_3' => 'nullable|string|max:255',
        ];
    }
}
