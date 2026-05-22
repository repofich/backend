<?php

namespace App\Http\Controllers;

use App\Http\Requests\CurriculumRequest;
use App\Http\Requests\PhotoRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $users = User::with('career')
            ->when(request('user_type'), fn($q, $type) => $q->where('user_type', $type))
            ->when(request('career_id'), fn($q, $id) => $q->where('career_id', $id))
            ->get();

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        $user->load('career', 'theses');

        return new UserResource($user);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'career_id' => $request->career_id,
            'ci' => $request->ci,
            'registration_number' => $request->registration_number,
        ]);

        return response()->json([
            'message' => 'Usuario creado.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuario actualizado.',
            'user' => new UserResource($user->fresh()->load('career')),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }
        if ($user->curriculum_pdf_path) {
            Storage::disk('public')->delete($user->curriculum_pdf_path);
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function updatePhoto(PhotoRequest $request, User $user): JsonResponse
    {
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $path = $request->file('photo')->store('users/' . $user->id, 'public');
        $user->update(['photo_path' => $path]);

        return response()->json([
            'message' => 'Foto actualizada.',
            'photo_url' => $user->fresh()->photo_url,
        ]);
    }

    public function updateCurriculum(CurriculumRequest $request, User $user): JsonResponse
    {
        if ($user->curriculum_pdf_path) {
            Storage::disk('public')->delete($user->curriculum_pdf_path);
        }

        $path = $request->file('curriculum')->store('users/' . $user->id, 'public');
        $user->update(['curriculum_pdf_path' => $path]);

        return response()->json([
            'message' => 'Currículum actualizado.',
            'curriculum_url' => $user->fresh()->curriculum_url,
        ]);
    }

    public function deletePhoto(User $user): JsonResponse
    {
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
            $user->update(['photo_path' => null]);
        }

        return response()->json(['message' => 'Foto eliminada.']);
    }

    public function deleteCurriculum(User $user): JsonResponse
    {
        if ($user->curriculum_pdf_path) {
            Storage::disk('public')->delete($user->curriculum_pdf_path);
            $user->update(['curriculum_pdf_path' => null]);
        }

        return response()->json(['message' => 'Currículum eliminado.']);
    }
}
