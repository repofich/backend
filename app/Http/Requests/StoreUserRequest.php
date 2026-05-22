<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'user_type' => ['required', 'string', 'in:vicedecano,director,tutor,tribunal,estudiante'],
            'career_id' => ['required', 'integer', 'exists:careers,id'],
            'ci' => ['nullable', 'string', 'max:20', 'unique:users,ci'],
            'registration_number' => ['nullable', 'string', 'max:50', 'unique:users,registration_number'],
        ];
    }
}
