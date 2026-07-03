<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFormatRequest;
use App\Http\Requests\UpdateFormatRequest;
use App\Http\Resources\FormatResource;
use App\Models\Format;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FormatController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $formats = Format::latest()->get();

        return FormatResource::collection($formats);
    }

    public function show(Format $format): FormatResource
    {
        return new FormatResource($format);
    }

    public function store(StoreFormatRequest $request): JsonResponse
    {
        $format = Format::create($request->validated());

        return response()->json([
            'message' => 'Formato creado.',
            'format' => new FormatResource($format),
        ], 201);
    }

    public function update(UpdateFormatRequest $request, Format $format): JsonResponse
    {
        $format->update($request->validated());

        return response()->json([
            'message' => 'Formato actualizado.',
            'format' => new FormatResource($format),
        ]);
    }

    public function destroy(Format $format): JsonResponse
    {
        $format->delete();

        return response()->json(['message' => 'Formato eliminado.']);
    }
}
