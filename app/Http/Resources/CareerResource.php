<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CareerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'knowledge_areas' => $this->knowledge_areas,
            'director_id' => $this->director_id,
            'format_config' => $this->format_config,
            'director' => $this->whenLoaded('director', function () {
                if (!$this->director) return null;
                return [
                    'id' => $this->director->id,
                    'full_name' => $this->director->full_name,
                    'email' => $this->director->email,
                    'user_type' => $this->director->user_type,
                ];
            }),
            'users_count' => $this->whenCounted('users'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
