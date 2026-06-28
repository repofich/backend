<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'comments' => ['nullable', 'string'],
            'recommendation' => ['required', 'string', 'in:aprobar,observar,rechazar'],
            'file_path' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
