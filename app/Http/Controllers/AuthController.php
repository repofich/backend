<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UniversityValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private readonly UniversityValidationService $validationService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        if (!$this->validationService->validateStudent(
            $request->ci,
            $request->registration_number
        )) {
            return response()->json([
                'message' => 'Los datos de estudiante no pudieron ser validados.',
            ], 422);
        }

        $user = User::create([
            'ci' => $request->ci,
            'registration_number' => $request->registration_number,
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'career_id' => $request->career_id,
            'user_type' => 'estudiante',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)
            ->orWhere('ci', $request->ci)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request): UserResource
    {
        $request->user()->load('career');

        return new UserResource($request->user());
    }

    public function updateMyPhoto(PhotoRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->photo_path) {
            \Storage::disk('public')->delete($user->photo_path);
        }

        $path = $request->file('photo')->store('users/' . $user->id, 'public');
        $user->update(['photo_path' => $path]);

        return response()->json([
            'message' => 'Foto actualizada.',
            'photo_url' => $user->fresh()->photo_url,
        ]);
    }

    public function updateMyCurriculum(CurriculumRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->curriculum_pdf_path) {
            \Storage::disk('public')->delete($user->curriculum_pdf_path);
        }

        $path = $request->file('curriculum')->store('users/' . $user->id, 'public');
        $user->update(['curriculum_pdf_path' => $path]);

        return response()->json([
            'message' => 'Currículum actualizado.',
            'curriculum_url' => $user->fresh()->curriculum_url,
        ]);
    }
}
