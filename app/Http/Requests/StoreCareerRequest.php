<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCareerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:careers,name'],
            'knowledge_areas' => ['nullable', 'array'],
            'knowledge_areas.*' => ['string', 'max:255'],
        ];
    }
}
