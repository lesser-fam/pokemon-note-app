<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DuplicatePartyRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'concept' => 'nullable|string',
            'memo' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'パーティ名を入力してください。',
            'name.max' => 'パーティ名は255字以内で入力してください。',
        ];
    }
}
