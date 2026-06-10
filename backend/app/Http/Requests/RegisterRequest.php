<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|max:255|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         =>            '名前を入力してください。',
            'name.string'           =>            '名前は文字で入力してください。',
            'name.max'              =>            '名前は255文字以内で入力してください。',

            'email.required'        =>            'メールアドレスを入力してください。',
            'email.email'           =>            'メールアドレスの形式で入力してください。',
            'email.max'             =>            'メールアドレスは255文字以内で入力してください。',
            'email.unique'          =>            'このメールアドレスはすでに登録されています。',

            'password.required'     =>            'パスワードを入力してください。',
            'password.string'       =>            'パスワードは文字で入力してください。',
            'password.min'          =>            'パスワードは8文字以上で入力してください。',
            'password.confirmed'    =>            '確認用パスワードが一致していません。',
        ];
    }
}
