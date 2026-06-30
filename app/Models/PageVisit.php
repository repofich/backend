<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageVisit extends Model
{
    protected $fillable = [
        'path',
        'visits',
        'last_visited_at',
    ];

    protected function casts(): array
    {
        return [
            'visits' => 'integer',
            'last_visited_at' => 'datetime',
        ];
    }
}
