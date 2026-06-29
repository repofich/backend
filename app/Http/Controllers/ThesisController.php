<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreThesisRequest;
use App\Http\Requests\UpdateThesisRequest;
use App\Http\Requests\UpdateThesisStatusRequest;
use App\Http\Resources\ThesisResource;
use App\Models\Category;
use App\Models\Thesis;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ThesisController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])->latest()->get();

        return ThesisResource::collection($theses);
    }

    public function show(Thesis $thesis): ThesisResource
    {
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return new ThesisResource($thesis);
    }

    public function store(StoreThesisRequest $request): JsonResponse
    {
        $thesis = Thesis::create($request->validated());

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
        $thesis->update($request->validated());

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

        if ($user->user_type !== 'tutor') {
            return response()->json([
                'message' => 'El usuario seleccionado no es un tutor.',
            ], 422);
        }

        $thesis->update(['tutor_id' => $user->id]);
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tutor asignado.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function removeTutor(Thesis $thesis): JsonResponse
    {
        $thesis->update(['tutor_id' => null]);
        $thesis->load(['user', 'tutor', 'category', 'tags', 'files']);

        return response()->json([
            'message' => 'Tutor removido.',
            'thesis' => new ThesisResource($thesis),
        ]);
    }

    public function featured(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->where('featured', true)
            ->latest()
            ->get();

        return ThesisResource::collection($theses);
    }

    public function recent(): AnonymousResourceCollection
    {
        $theses = Thesis::with(['user', 'tutor', 'category', 'tags', 'files'])
            ->latest()
            ->take(10)
            ->get();

        return ThesisResource::collection($theses);
    }

    public function search(Request $request): AnonymousResourceCollection
    {
        $query = Thesis::with(['user', 'tutor', 'category', 'tags', 'files']);

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

        $data = ['status' => $request->status];

        if ($request->status === 'publicado') {
            $data['published_at'] = now();
        }

        if ($request->status !== 'publicado' && $thesis->published_at) {
            $data['published_at'] = null;
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
}
