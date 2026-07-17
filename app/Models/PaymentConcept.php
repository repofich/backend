<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentConcept extends Model
{
    use HasFactory;

    protected $fillable = [
        'career_id',
        'name',
        'code',
        'description',
        'amount',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCode($query, string $code)
    {
        return $query->where('code', $code);
    }

    public function scopeForCareer($query, ?int $careerId)
    {
        return $query->where(function ($q) use ($careerId) {
            $q->whereNull('career_id')
              ->orWhere('career_id', $careerId);
        });
    }
}
