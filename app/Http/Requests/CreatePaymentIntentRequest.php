<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:100'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'concept' => ['sometimes', 'string', 'max:255'],
            'payment_type' => ['required', 'string', 'in:contado,credito'],
        ];
    }
}
