<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThesisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'abstract' => $this->abstract,
            'tutor' => $this->tutor,
            'tutor_id' => $this->tutor_id,
            'tutor_user' => $this->when(
                $this->resource->relationLoaded('tutor'),
                fn() => new UserResource($this->resource->getRelation('tutor'))
            ),
            'repo_url' => $this->repo_url,
            'demo_url' => $this->demo_url,
            'featured' => $this->featured,
            'type' => $this->type,
            'status' => $this->status,
            'user' => new UserResource($this->whenLoaded('user')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'files' => ThesisFileResource::collection($this->whenLoaded('files')),
            'assigned_evaluator' => new UserResource($this->whenLoaded('assignedEvaluator')),
            'evaluations' => EvaluationResource::collection($this->whenLoaded('evaluations')),
            'published_at' => $this->published_at,
            'observations' => $this->observations,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
