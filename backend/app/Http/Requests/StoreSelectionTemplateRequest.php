<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSelectionTemplateRequest extends FormRequest
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
            'name'                  => 'required|string|max:255',
            'lead_pokemon_id'       => 'required|integer|exists:party_pokemon,id',
            'switch_pokemon_id'     => 'required|integer|exists:party_pokemon,id',
            'finisher_pokemon_id'   => 'required|integer|exists:party_pokemon,id',
            'memo'                  => 'nullable|string',
        ];
    }
}
