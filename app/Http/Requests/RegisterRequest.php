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
            'ci' => ['required', 'string', 'max:20', 'unique:users,ci'],
            'registration_number' => ['required', 'string', 'max:50', 'unique:users,registration_number'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'career_id' => ['required', 'integer', 'exists:careers,id'],
        ];
    }
}
