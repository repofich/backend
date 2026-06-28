<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Http\Requests\UpdateEvaluationRequest;
use App\Http\Resources\EvaluationResource;
use App\Http\Resources\ThesisResource;
use App\Models\Evaluation;
use App\Models\Thesis;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EvaluationController extends Controller
{
    public function index(Thesis $thesis): AnonymousResourceCollection
    {
        $evaluations = $thesis->evaluations()->with('evaluator')->get();

        return EvaluationResource::collection($evaluations);
    }

    public function show(Thesis $thesis, Evaluation $evaluation): EvaluationResource
    {
        $evaluation->load('evaluator');

        return new EvaluationResource($evaluation);
    }

    public function store(StoreEvaluationRequest $request, Thesis $thesis): JsonResponse
    {
        if (auth()->id() !== $thesis->assigned_evaluator_id) {
            return response()->json(['message' => 'No eres el evaluador asignado a esta tesis.'], 403);
        }

        if ($thesis->evaluations()->where('evaluator_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Ya evaluaste esta tesis.'], 409);
        }

        $evaluation = $thesis->evaluations()->create([
            'evaluator_id' => auth()->id(),
            'score' => $request->score,
            'comments' => $request->comments,
            'recommendation' => $request->recommendation,
            'file_path' => $request->file_path,
            'submitted_at' => now(),
        ]);

        $this->updateThesisStatus($thesis, $request->recommendation);

        $evaluation->load('evaluator');

        return response()->json([
            'message' => 'Evaluación registrada.',
            'evaluation' => new EvaluationResource($evaluation),
        ], 201);
    }

    public function update(UpdateEvaluationRequest $request, Thesis $thesis, Evaluation $evaluation): JsonResponse
    {
        if (auth()->id() !== $thesis->assigned_evaluator_id) {
            return response()->json(['message' => 'No eres el evaluador asignado a esta tesis.'], 403);
        }

        $evaluation->update($request->validated());

        if ($request->has('recommendation')) {
            $this->updateThesisStatus($thesis, $request->recommendation);
        }

        $evaluation->load('evaluator');

        return response()->json([
            'message' => 'Evaluación actualizada.',
            'evaluation' => new EvaluationResource($evaluation),
        ]);
    }

    public function destroy(Thesis $thesis, Evaluation $evaluation): JsonResponse
    {
        if (auth()->id() !== $thesis->assigned_evaluator_id) {
            return response()->json(['message' => 'No eres el evaluador asignado a esta tesis.'], 403);
        }

        $evaluation->delete();

        return response()->json(['message' => 'Evaluación eliminada.']);
    }

    public function assignEvaluator(Request $request, Thesis $thesis): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->user_type !== 'tribunal') {
            return response()->json([
                'message' => 'El usuario seleccionado no es un tribunal.',
            ], 422);
        }

        $thesis->update(['assigned_evaluator_id' => $user->id]);
        $thesis->load(['user', 'tutor', 'assignedEvaluator', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Evaluador asignado.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function removeEvaluator(Thesis $thesis): JsonResponse
    {
        $thesis->update(['assigned_evaluator_id' => null]);
        $thesis->load(['user', 'tutor', 'assignedEvaluator', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Evaluador removido.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    private function updateThesisStatus(Thesis $thesis, string $recommendation): void
    {
        $statusMap = [
            'aprobar' => 'aprobado',
            'observar' => 'observado',
            'rechazar' => 'rechazado',
        ];

        $thesis->update(['status' => $statusMap[$recommendation]]);
    }
}
