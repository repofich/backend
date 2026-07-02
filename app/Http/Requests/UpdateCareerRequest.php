<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCareerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', 'unique:careers,name,' . $this->route('career')],
            'knowledge_areas' => ['nullable', 'array'],
            'knowledge_areas.*' => ['string', 'max:255'],
        ];
    }
}
