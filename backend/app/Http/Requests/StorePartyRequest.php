<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class StorePartyRequest extends FormRequest
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
            'name'      => 'required|string|max:255',
            'rule'      => 'nullable|string|in:main_series,champions',
            'concept'   => 'nullable|string',
            'memo'      => 'nullable|string',
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'name.required' => 'パーティ名を入力してください。',
            'name.max'      => 'パーティ名は255字以内で入力してください。'
        ];
    }
}
