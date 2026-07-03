<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCareerRequest;
use App\Http\Requests\UpdateCareerRequest;
use App\Http\Resources\CareerResource;
use App\Models\Career;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CareerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $careers = Career::withCount('users')->latest()->get();

        return CareerResource::collection($careers);
    }

    public function show(Career $career): CareerResource
    {
        $career->loadCount('users');

        return new CareerResource($career);
    }

    public function store(StoreCareerRequest $request): JsonResponse
    {
        $career = Career::create($request->validated());

        return response()->json([
            'message' => 'Carrera creada.',
            'career' => new CareerResource($career),
        ], 201);
    }

    public function update(UpdateCareerRequest $request, Career $career): JsonResponse
    {
        $career->update($request->validated());

        return response()->json([
            'message' => 'Carrera actualizada.',
            'career' => new CareerResource($career),
        ]);
    }

    public function destroy(Career $career): JsonResponse
    {
        if ($career->users()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la carrera porque tiene usuarios asociados.',
            ], 409);
        }

        $career->delete();

        return response()->json(['message' => 'Carrera eliminada.']);
    }
}
