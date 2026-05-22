<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ci' => $this->ci,
            'registration_number' => $this->registration_number,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'user_type' => $this->user_type,
            'career' => new CareerResource($this->whenLoaded('career')),
            'photo_url' => $this->photo_url,
            'curriculum_url' => $this->curriculum_url,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
