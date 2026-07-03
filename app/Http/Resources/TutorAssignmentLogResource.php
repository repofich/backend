<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorAssignmentLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'previous_tutor' => $this->whenLoaded('previousTutor', fn () => new UserResource($this->previousTutor)),
            'new_tutor' => $this->whenLoaded('newTutor', fn () => new UserResource($this->newTutor)),
            'action' => $this->action,
            'changed_by' => $this->whenLoaded('changedBy', fn () => new UserResource($this->changedBy)),
            'created_at' => $this->created_at,
        ];
    }
}
