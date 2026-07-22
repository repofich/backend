<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorObservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'tutor' => [
                'id' => $this->tutor->id,
                'full_name' => $this->tutor->full_name,
            ],
            'comment' => $this->comment,
            'created_at' => $this->created_at,
        ];
    }
}
