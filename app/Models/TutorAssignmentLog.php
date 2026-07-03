<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorAssignmentLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'thesis_id',
        'previous_tutor_id',
        'new_tutor_id',
        'action',
        'changed_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    public function previousTutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'previous_tutor_id');
    }

    public function newTutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'new_tutor_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
