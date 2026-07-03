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
            'password' => [
                'required', 'string', 'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*?&#.,;:\[\]{}()<>_\-+=~^|\\\\\/]/',
            ],
            'career_id' => ['required', 'integer', 'exists:careers,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ci.unique' => 'El CI ya está registrado.',
            'ci.required' => 'El CI es obligatorio.',
            'registration_number.unique' => 'El número de registro ya está registrado.',
            'registration_number.required' => 'El número de registro es obligatorio.',
            'full_name.required' => 'El nombre completo es obligatorio.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingrese un correo electrónico válido.',
            'password.regex' => 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'career_id.required' => 'Debe seleccionar una carrera.',
            'career_id.exists' => 'La carrera seleccionada no es válida.',
        ];
    }
}
