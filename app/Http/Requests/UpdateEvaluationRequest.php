<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'comments' => ['sometimes', 'nullable', 'string'],
            'recommendation' => ['sometimes', 'required', 'string', 'in:aprobar,observar,rechazar'],
            'file_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ];
    }
}
