<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'thesis_id',
        'evaluator_id',
        'score',
        'comments',
        'recommendation',
        'file_path',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'thesis_id' => 'integer',
            'evaluator_id' => 'integer',
            'score' => 'integer',
            'submitted_at' => 'datetime',
        ];
    }

    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
