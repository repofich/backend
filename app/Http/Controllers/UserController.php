<?php

namespace App\Http\Controllers;

use App\Http\Requests\CurriculumRequest;
use App\Http\Requests\PhotoRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::with('career')
            ->when($request->filled('query'), function ($q) use ($request) {
                $s = $request->query;
                $q->where(function ($q2) use ($s) {
                    $q2->where('full_name', 'like', '%' . $s . '%')
                        ->orWhere('email', 'like', '%' . $s . '%')
                        ->orWhere('ci', 'like', '%' . $s . '%');
                });
            })
            ->when($request->filled('user_type'), fn($q, $type) => $q->where('user_type', $type))
            ->when($request->filled('career_id'), fn($q, $id) => $q->where('career_id', $id))
            ->when($request->filled('is_active'), fn($q, $active) => $q->where('is_active', $active === 'true' || $active === '1'))
            ->latest()
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

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'Usuario activado.' : 'Usuario desactivado.',
            'user' => new UserResource($user->fresh()->load('career')),
        ]);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'message' => 'Contraseña restablecida.',
        ]);
    }
}
