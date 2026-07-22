<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Thesis extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'abstract',
        'tutor',
        'repo_url',
        'demo_url',
        'user_id',
        'category_id',
        'featured',
        'type',
        'status',
        'tutor_id',
        'tutor_status',
        'career_id',
        'assigned_evaluator_id',
        'published_at',
        'observations',
        'defense_paid_at',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'user_id' => 'integer',
            'category_id' => 'integer',
            'tutor_id' => 'integer',
            'assigned_evaluator_id' => 'integer',
            'featured' => 'boolean',
            'status' => 'string',
            'tutor_status' => 'string',
            'published_at' => 'datetime',
            'defense_paid_at' => 'datetime',
            'observations' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class);
    }
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'thesis_tags');
    }
    public function files(): HasMany
    {
        return $this->hasMany(ThesisFile::class);
    }

    public function assignedEvaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_evaluator_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function assignmentLogs(): HasMany
    {
        return $this->hasMany(TutorAssignmentLog::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function tutorObservations(): HasMany
    {
        return $this->hasMany(TutorObservation::class);
    }

    public static array $transitions = [
        'borrador'    => ['en_revision'],
        'en_revision' => ['observado', 'aprobado', 'rechazado'],
        'observado'   => ['en_revision'],
        'aprobado'    => ['publicado'],
        'publicado'   => [],
        'rechazado'   => ['borrador'],
    ];

    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, self::$transitions[$this->status] ?? []);
    }

    public function isDefensePaid(): bool
    {
        return $this->defense_paid_at !== null;
    }

    public function scopePendingDefensePayment($query)
    {
        return $query->where('status', 'aprobado')
            ->whereNull('defense_paid_at');
    }
}
