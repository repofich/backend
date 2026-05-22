<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required_without:ci', 'string', 'email'],
            'ci' => ['required_without:email', 'string', 'max:20'],
            'password' => ['required', 'string'],
        ];
    }
}
