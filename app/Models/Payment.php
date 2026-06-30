<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_payment_intent_id',
        'stripe_payment_method_id',
        'amount',
        'currency',
        'concept',
        'payment_type',
        'installment_number',
        'total_installments',
        'status',
        'due_date',
        'paid_at',
        'parent_payment_id',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'due_date' => 'date',
            'amount' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'parent_payment_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Payment::class, 'parent_payment_id');
    }
}
