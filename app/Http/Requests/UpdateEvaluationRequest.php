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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->has('recommendation')) {
                return;
            }

            $score = $this->input('score');
            if ($score === null || $score === '') {
                return;
            }

            $score = (int) $score;
            $rec = $this->input('recommendation');

            if ($score >= 60 && $rec !== 'aprobar') {
                $validator->errors()->add('recommendation', 'La nota es 60 o superior. La recomendación debe ser "Aprobar".');
            }

            if ($score < 60 && $rec === 'aprobar') {
                $validator->errors()->add('recommendation', 'La nota es menor a 60. No se puede aprobar la tesis.');
            }
        });
    }
}
