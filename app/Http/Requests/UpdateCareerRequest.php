<?php

namespace App\Http\Requests;

use App\Models\Career;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCareerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('careers')->ignore($this->route('career')),
            ],
            'knowledge_areas' => ['nullable', 'array'],
            'knowledge_areas.*' => ['string', 'max:255'],
            'director_id' => ['nullable', 'integer', 'exists:users,id'],
            'format_config' => ['nullable', 'array'],
        ];
    }
}
