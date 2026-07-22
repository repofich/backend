<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreThesisRequest;
use App\Http\Requests\StoreTutorObservationRequest;
use App\Http\Requests\UpdateThesisRequest;
use App\Http\Requests\UpdateThesisStatusRequest;
use App\Http\Resources\ThesisResource;
use App\Http\Resources\TutorAssignmentLogResource;
use App\Http\Resources\TutorObservationResource;
use App\Models\Category;
use App\Models\Thesis;
use App\Models\TutorAssignmentLog;
use App\Models\TutorObservation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ThesisController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('status', 'publicado')
            ->latest()
            ->get();

        return ThesisResource::collection($theses);
    }

    public function show(Thesis $thesis): ThesisResource
    {
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        if ($thesis->status !== 'publicado') {
            $user = auth('api')->user();
            $allowed = $user && (
                $thesis->user_id === $user->id ||
                in_array($user->user_type, ['admin', 'vicedecano', 'director']) ||
                $thesis->tutor_id === $user->id ||
                $thesis->assigned_evaluator_id === $user->id
            );

            if (!$allowed) {
                abort(404);
            }
        }

        return new ThesisResource($thesis);
    }

    public function store(StoreThesisRequest $request): JsonResponse
    {
        $data = $request->validated();
        $tutor = User::where('user_type', 'docente')->findOrFail($data['tutor_id']);

        $thesis = Thesis::create([
            ...$data,
            'tutor' => $data['tutor'] ?? $tutor->full_name,
            'tutor_status' => 'pending',
        ]);

        if ($request->has('tags')) {
            $thesis->tags()->sync($request->tags);
        }

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tesis creada.',
            'thesis' => new ThesisResource($thesis),
        ], 201);
    }

    public function update(UpdateThesisRequest $request, Thesis $thesis): JsonResponse
    {
        if ($thesis->user_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el autor de esta tesis.'], 403);
        }

        if (!in_array($thesis->status, ['borrador', 'observado'])) {
            return response()->json(['message' => 'Solo se puede editar en estado borrador u observado.'], 422);
        }

        $data = $request->validated();

        if (!empty($data['tutor_id']) && (int) $data['tutor_id'] !== $thesis->tutor_id) {
            $tutor = User::where('user_type', 'docente')->findOrFail($data['tutor_id']);
            $data['tutor'] = $data['tutor'] ?? $tutor->full_name;
            $data['tutor_status'] = 'pending';
        }

        $thesis->update($data);

        if ($request->has('tags')) {
            $thesis->tags()->sync($request->tags);
        }

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tesis actualizada.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function destroy(Thesis $thesis): JsonResponse
    {
        $thesis->tags()->detach();
        $thesis->files()->delete();
        $thesis->delete();

        return response()->json(['message' => 'Tesis eliminada.']);
    }

    public function assignTutor(Request $request, Thesis $thesis): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->user_type !== 'docente') {
            return response()->json([
                'message' => 'El usuario seleccionado no es un docente.',
            ], 422);
        }

        $previousTutorId = $thesis->tutor_id;
        $action = $previousTutorId ? 'changed' : 'assigned';

        $thesis->update([
            'tutor_id' => $user->id,
            'tutor' => $user->full_name,
            'tutor_status' => 'pending',
        ]);

        TutorAssignmentLog::create([
            'thesis_id' => $thesis->id,
            'previous_tutor_id' => $previousTutorId,
            'new_tutor_id' => $user->id,
            'action' => $action . '_pending',
            'changed_by' => auth()->id(),
            'created_at' => now(),
        ]);

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tutor sugerido. Queda pendiente de aceptación.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function respondTutor(Request $request, Thesis $thesis): JsonResponse
    {
        $request->validate([
            'response' => ['required', 'string', 'in:accepted,rejected'],
        ]);

        if ($thesis->tutor_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el tutor asignado a esta tesis.'], 403);
        }

        if ($thesis->tutor_status !== 'pending') {
            return response()->json(['message' => 'Esta solicitud de tutoría ya fue respondida.'], 422);
        }

        $thesis->update(['tutor_status' => $request->response]);

        TutorAssignmentLog::create([
            'thesis_id' => $thesis->id,
            'previous_tutor_id' => $thesis->tutor_id,
            'new_tutor_id' => $thesis->tutor_id,
            'action' => $request->response === 'accepted' ? 'accepted' : 'rejected',
            'changed_by' => auth()->id(),
            'created_at' => now(),
        ]);

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => $request->response === 'accepted'
                ? 'Tutoría aceptada.'
                : 'Tutoría rechazada. Un administrador debe asignar otro tutor.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function removeTutor(Thesis $thesis): JsonResponse
    {
        $previousTutorId = $thesis->tutor_id;

        $thesis->update([
            'tutor_id' => null,
            'tutor_status' => null,
        ]);

        if ($previousTutorId) {
            TutorAssignmentLog::create([
                'thesis_id' => $thesis->id,
                'previous_tutor_id' => $previousTutorId,
                'new_tutor_id' => null,
                'action' => 'removed',
                'changed_by' => auth()->id(),
                'created_at' => now(),
            ]);
        }

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tutor removido.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function tutorHistory(Thesis $thesis): AnonymousResourceCollection
    {
        $logs = $thesis->assignmentLogs()
            ->with(['previousTutor', 'newTutor', 'changedBy'])
            ->latest('created_at')
            ->get();

        return TutorAssignmentLogResource::collection($logs);
    }

    public function featured(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('featured', true)
            ->where('status', 'publicado')
            ->latest()
            ->get();

        return ThesisResource::collection($theses);
    }

    public function recent(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('status', 'publicado')
            ->latest()
            ->take(10)
            ->get();

        return ThesisResource::collection($theses);
    }

    public function search(Request $request): AnonymousResourceCollection
    {
        $query = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('status', 'publicado');

        if ($request->filled('query')) {
            $search = $request->input('query');

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('abstract', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('full_name', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('category', function ($q2) use ($search) {
                        $q2->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->year);
        }

        if ($request->filled('career')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->career . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return ThesisResource::collection($query->get());
    }

    public function updateStatus(UpdateThesisStatusRequest $request, Thesis $thesis): JsonResponse
    {
        if (!$thesis->canTransitionTo($request->status)) {
            return response()->json([
                'message' => 'Transición de estado no válida de ' . $thesis->status . ' a ' . $request->status . '.',
            ], 422);
        }

        if ($request->status === 'publicado') {
            $hasValidScore = $thesis->evaluations()->where('score', '>=', 60)->exists();
            if (!$hasValidScore) {
                return response()->json([
                    'message' => 'No se puede publicar la tesis. Debe tener al menos una evaluación con nota igual o superior a 60.',
                ], 422);
            }
        }

        $data = ['status' => $request->status];

        if ($request->status === 'publicado') {
            $data['published_at'] = now();
        }

        if ($request->status !== 'publicado' && $thesis->published_at) {
            $data['published_at'] = null;
        }

        if ($request->filled('observations')) {
            $data['observations'] = $request->observations;
        }

        $thesis->update($data);
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Estado de la tesis actualizado a ' . $request->status . '.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function submit(Request $request, Thesis $thesis): JsonResponse
    {
        if ($thesis->user_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el autor de esta tesis.'], 403);
        }

        $allowed = ['borrador' => 'en_revision', 'observado' => 'en_revision'];

        if (!isset($allowed[$thesis->status])) {
            return response()->json([
                'message' => 'No puedes enviar esta tesis en su estado actual (' . $thesis->status . ').',
            ], 422);
        }

        if (!$thesis->files()->exists()) {
            return response()->json([
                'message' => 'Debe adjuntar al menos un archivo antes de enviar a revisión.',
            ], 422);
        }

        if ($thesis->tutor_status !== 'accepted') {
            return response()->json([
                'message' => 'No puedes enviar la tesis a revisión hasta que el tutor acepte la tutoría.',
            ], 422);
        }

        $thesis->update(['status' => $allowed[$thesis->status]]);
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tesis enviada a revisión.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function published(Request $request): AnonymousResourceCollection
    {
        $query = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('status', 'publicado');

        if ($request->filled('status')) {
            $allowed = ['publicado', 'aprobado', 'en_revision', 'observado', 'borrador', 'rechazado'];

            if (in_array($request->status, $allowed)) {
                $query->where('status', $request->status);
            }
        }

        return ThesisResource::collection($query->latest('published_at')->get());
    }

    public function stats(): JsonResponse
    {
        $byCareer = Category::withCount('theses')->get();
        $withCode = Thesis::whereNotNull('repo_url')->count();
        $total = Thesis::count();

        return response()->json([
            'total' => $total,
            'with_code' => $withCode,
            'by_career' => $byCareer,
        ]);
    }

    public function tutorObservations(Thesis $thesis): AnonymousResourceCollection
    {
        $observations = $thesis->tutorObservations()
            ->with('tutor')
            ->latest()
            ->get();

        return TutorObservationResource::collection($observations);
    }

    public function storeObservation(StoreTutorObservationRequest $request, Thesis $thesis): JsonResponse
    {
        if ($thesis->tutor_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el tutor de esta tesis.'], 403);
        }

        if ($thesis->tutor_status !== 'accepted') {
            return response()->json(['message' => 'Debes aceptar la tutoría antes de dejar observaciones.'], 422);
        }

        $observation = TutorObservation::create([
            'thesis_id' => $thesis->id,
            'tutor_id' => auth()->id(),
            'comment' => $request->comment,
        ]);

        $observation->load('tutor');

        return response()->json([
            'message' => 'Observación registrada.',
            'observation' => new TutorObservationResource($observation),
        ], 201);
    }

    public function tutorApprove(Request $request, Thesis $thesis): JsonResponse
    {
        if ($thesis->tutor_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el tutor de esta tesis.'], 403);
        }

        if ($thesis->tutor_status !== 'accepted') {
            return response()->json(['message' => 'Debes aceptar la tutoría antes de aprobar.'], 422);
        }

        if (!$thesis->canTransitionTo('aprobado')) {
            return response()->json(['message' => 'No se puede aprobar desde el estado ' . $thesis->status . '.'], 422);
        }

        $thesis->update(['status' => 'aprobado']);

        if ($request->filled('comment')) {
            TutorObservation::create([
                'thesis_id' => $thesis->id,
                'tutor_id' => auth()->id(),
                'comment' => 'Aprobado: ' . $request->comment,
            ]);
        }

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tesis aprobada.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function tutorRequestChanges(Request $request, Thesis $thesis): JsonResponse
    {
        if ($thesis->tutor_id !== auth()->id()) {
            return response()->json(['message' => 'No eres el tutor de esta tesis.'], 403);
        }

        if ($thesis->tutor_status !== 'accepted') {
            return response()->json(['message' => 'Debes aceptar la tutoría antes de solicitar cambios.'], 422);
        }

        if (!$thesis->canTransitionTo('observado')) {
            return response()->json(['message' => 'No se puede marcar como observado desde ' . $thesis->status . '.'], 422);
        }

        $request->validate(['comment' => ['required', 'string']]);

        $thesis->update([
            'status' => 'observado',
            'observations' => $request->comment,
        ]);

        TutorObservation::create([
            'thesis_id' => $thesis->id,
            'tutor_id' => auth()->id(),
            'comment' => 'Cambios solicitados: ' . $request->comment,
        ]);

        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Cambios solicitados al estudiante.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function pendingDefensePayment(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['category', 'career'])
            ->where('user_id', auth()->id())
            ->pendingDefensePayment()
            ->latest()
            ->get();

        return ThesisResource::collection($theses);
    }
}
