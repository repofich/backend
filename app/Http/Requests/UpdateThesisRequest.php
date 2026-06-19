<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateThesisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'abstract' => ['sometimes', 'string'],
            'tutor' => ['sometimes', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'repo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'featured' => ['sometimes', 'boolean'],
            'type' => ['nullable', 'string', 'max:100'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }
}
