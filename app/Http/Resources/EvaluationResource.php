<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'thesis_id' => $this->thesis_id,
            'evaluator' => new UserResource($this->whenLoaded('evaluator')),
            'score' => $this->score,
            'comments' => $this->comments,
            'recommendation' => $this->recommendation,
            'file_path' => $this->file_path,
            'submitted_at' => $this->submitted_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
