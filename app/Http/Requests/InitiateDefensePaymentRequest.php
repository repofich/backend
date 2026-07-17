<?php

namespace App\Http\Requests;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;

class InitiateDefensePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $thesis = Thesis::find($this->thesis_id);

        if (!$thesis) {
            return false;
        }

        if ($thesis->user_id !== $this->user()->id) {
            return false;
        }

        if ($thesis->status !== 'aprobado') {
            return false;
        }

        if ($thesis->defense_paid_at !== null) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'thesis_id' => ['required', 'integer', 'exists:theses,id'],
            'payment_type' => ['required', 'string', 'in:contado,credito'],
            'installments' => ['required_if:payment_type,credito', 'integer', 'min:2', 'max:12'],
            'payment_method_id' => ['sometimes', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'thesis_id.required' => 'La tesis es requerida.',
            'thesis_id.exists' => 'La tesis no existe.',
            'payment_type.required' => 'El tipo de pago es requerido.',
            'payment_type.in' => 'El tipo de pago debe ser contado o credito.',
            'installments.required_if' => 'El número de cuotas es requerido para pago al crédito.',
            'installments.min' => 'El número mínimo de cuotas es 2.',
            'installments.max' => 'El número máximo de cuotas es 12.',
        ];
    }
}
