<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $this->route('user')],
            'user_type' => ['sometimes', 'string', 'in:admin,vicedecano,director,tutor,tribunal,docente,estudiante'],
            'career_id' => ['sometimes', 'nullable', 'integer', 'exists:careers,id'],
            'ci' => ['sometimes', 'string', 'max:20', 'unique:users,ci,' . $this->route('user')],
            'registration_number' => ['sometimes', 'string', 'max:50', 'unique:users,registration_number,' . $this->route('user')],
        ];
    }
}
