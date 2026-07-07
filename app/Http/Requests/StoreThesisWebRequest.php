<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreThesisWebRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $required = $this->route('thesis') ? 'sometimes' : 'required';

        return [
            'title' => [$required, 'string', 'max:255'],
            'abstract' => [$required, 'string'],
            'tutor' => ['nullable', 'string', 'max:255'],
            'tutor_id' => [$required, 'integer', 'exists:users,id'],
            'category_id' => [$required, 'integer', 'exists:categories,id'],
            'career_id' => ['nullable', 'integer', 'exists:careers,id'],
            'type' => ['nullable', 'string', 'max:100'],
            'repo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'featured' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
            'keywords' => ['sometimes', 'array'],
            'keywords.*' => ['string', 'max:100'],
            'files' => ['sometimes', 'array'],
            'files.*' => ['file', 'mimes:pdf,doc,docx,jpg,png,jpeg,zip', 'max:20480'],
        ];
    }

}
}
