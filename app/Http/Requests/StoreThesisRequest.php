<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreThesisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'abstract' => ['required', 'string'],
            'tutor' => ['required', 'string', 'max:255'],
            'repo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'featured' => ['sometimes', 'boolean'],
            'type' => ['nullable', 'string', 'max:100'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }
}
