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
            'score' => ['required', 'integer', 'min:0', 'max:100'],
            'comments' => ['nullable', 'string'],
            'recommendation' => ['required', 'string', 'in:aprobar,observar,rechazar'],
            'file_path' => ['nullable', 'string', 'max:2048'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $score = (int) $this->integer('score');
            $rec = $this->recommendation;

            if ($score >= 60 && $rec !== 'aprobar') {
                $validator->errors()->add('recommendation', 'La nota es 60 o superior. La recomendación debe ser "Aprobar".');
            }

            if ($score < 60 && $rec === 'aprobar') {
                $validator->errors()->add('recommendation', 'La nota es menor a 60. No se puede aprobar la tesis.');
            }
        });
    }
}
