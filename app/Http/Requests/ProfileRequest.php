<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . auth()->id()],
            'career_id' => ['required', 'integer', 'exists:careers,id'],
            'photo' => ['nullable', 'image', 'mimes:jpg,png,jpeg', 'max:2048'],
            'curriculum' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
