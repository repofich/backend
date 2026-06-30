<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'concept' => $this->concept,
            'payment_type' => $this->payment_type,
            'installment_number' => $this->installment_number,
            'total_installments' => $this->total_installments,
            'status' => $this->status,
            'due_date' => $this->due_date,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
