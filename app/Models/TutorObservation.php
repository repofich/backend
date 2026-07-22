<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorObservation extends Model
{
    protected $fillable = [
        'thesis_id',
        'tutor_id',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'thesis_id' => 'integer',
            'tutor_id' => 'integer',
        ];
    }

    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }
}
