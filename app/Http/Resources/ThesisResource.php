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
                $this->resource->relationLoaded('tutor') && $this->resource->getRelation('tutor'),
                fn() => UserResource::make($this->resource->getRelation('tutor'))->resolve()
            ),
            'repo_url' => $this->repo_url,
            'demo_url' => $this->demo_url,
            'featured' => $this->featured,
            'type' => $this->type,
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn() => UserResource::make($this->user)->resolve()),
            'category' => $this->whenLoaded('category', fn() => CategoryResource::make($this->category)->resolve()),
            'tags' => $this->whenLoaded('tags', fn($tags) => $tags->map(fn($t) => TagResource::make($t)->resolve())->values()->all()),
            'files' => $this->whenLoaded('files', fn($files) => $files->map(fn($f) => ThesisFileResource::make($f)->resolve())->values()->all()),
            'assigned_evaluator' => $this->whenLoaded('assignedEvaluator', fn() => UserResource::make($this->assignedEvaluator)->resolve()),
            'evaluations' => $this->whenLoaded('evaluations', fn($evals) => $evals->map(fn($e) => EvaluationResource::make($e)->resolve())->values()->all()),
            'published_at' => $this->published_at,
            'observations' => $this->observations,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
