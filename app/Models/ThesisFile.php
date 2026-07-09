<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ThesisFile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'thesis_id',
        'file_path',
        'is_primary',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $appends = ['file_url'];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'thesis_id' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? url('/storage/' . $this->file_path) : null;
    }

    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }
}
