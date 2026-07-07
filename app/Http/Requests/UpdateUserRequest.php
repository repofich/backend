<?php

namespace App\Http\Requests;

use App\Models\User;
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
            'user_type' => ['sometimes', 'string', 'in:admin,vicedecano,director,tribunal,docente,estudiante'],
            'career_id' => ['sometimes', 'nullable', 'integer', 'exists:careers,id'],
            'ci' => ['sometimes', 'string', 'max:20', 'unique:users,ci,' . $this->route('user')],
            'registration_number' => ['sometimes', 'string', 'max:50', 'unique:users,registration_number,' . $this->route('user')],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->route('user');
            $newType = $this->input('user_type');

            if (!$newType) return;

            if ($newType === 'vicedecano') {
                if (User::where('user_type', 'vicedecano')->where('id', '!=', $user->id)->exists()) {
                    $validator->errors()->add('user_type', 'Ya existe un vicedecano.');
                }
            }

            if ($newType === 'director') {
                $careerId = $this->input('career_id', $user->career_id);
                if (!empty($careerId) && User::where('user_type', 'director')->where('career_id', $careerId)->where('id', '!=', $user->id)->exists()) {
                    $validator->errors()->add('user_type', 'Ya existe un director para esta carrera.');
                }
            }

            if ($user->user_type === 'admin' && $newType !== 'admin') {
                $adminCount = User::where('user_type', 'admin')->count();
                if ($adminCount <= 1) {
                    $validator->errors()->add('user_type', 'Debe haber al menos un administrador.');
                }
            }
        });
    }
}
