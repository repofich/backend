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
            'type' => ['nullable', 'string', 'max:100'],
            'repo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'featured' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['integer', 'exists:tags,id'],
            'keywords' => ['sometimes', 'array'],
            'keywords.*' => ['string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'abstract.required' => 'El resumen es obligatorio.',
            'tutor_id.required' => 'Debe seleccionar un tutor sugerido.',
            'tutor_id.integer' => 'El tutor seleccionado no es válido.',
            'tutor_id.exists' => 'El tutor seleccionado no existe.',
            'category_id.required' => 'Debe seleccionar una categoría.',
            'category_id.exists' => 'La categoría seleccionada no es válida.',
            'repo_url.url' => 'Ingrese una URL válida para el repositorio.',
            'demo_url.url' => 'Ingrese una URL válida para la demo.',
            'tags.array' => 'Las palabras clave seleccionadas no son válidas.',
            'tags.*.exists' => 'Una de las palabras clave seleccionadas no existe.',
            'keywords.array' => 'Las palabras clave seleccionadas no son válidas.',
            'keywords.*.max' => 'Cada palabra clave debe tener como máximo 100 caracteres.',
        ];
    }
}
