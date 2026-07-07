<?php

namespace App\Http\Requests;

use App\Models\User;
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
            'user_type' => ['required', 'string', 'in:admin,vicedecano,director,tribunal,docente'],
            'career_id' => ['nullable', 'integer', 'exists:careers,id'],
            'ci' => ['nullable', 'string', 'max:20', 'unique:users,ci'],
            'registration_number' => ['nullable', 'string', 'max:50', 'unique:users,registration_number'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $userType = $this->input('user_type');
            $careerId = $this->input('career_id');

            if ($userType === 'vicedecano') {
                if (User::where('user_type', 'vicedecano')->exists()) {
                    $validator->errors()->add('user_type', 'Ya existe un vicedecano.');
                }
            }

            if ($userType === 'director' && !empty($careerId)) {
                if (User::where('user_type', 'director')->where('career_id', $careerId)->exists()) {
                    $validator->errors()->add('user_type', 'Ya existe un director para esta carrera.');
                }
            }
        });
    }
}
