<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\UniversityValidationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController
{
    public function __construct(
        private readonly UniversityValidationService $validationService
    ) {}

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'ci' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $field = filter_var($request->ci, FILTER_VALIDATE_EMAIL) ? 'email' : 'ci';

        if (!Auth::guard('web')->attempt([$field => $request->ci, 'password' => $request->password])) {
            throw ValidationException::withMessages([
                'ci' => ['Credenciales inválidas.'],
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        if (!$this->validationService->validateStudent(
            $request->ci,
            $request->registration_number
        )) {
            throw ValidationException::withMessages([
                'ci' => ['Los datos de estudiante no pudieron ser validados.'],
            ]);
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

        Auth::guard('web')->login($user);

        $request->session()->regenerate();

        return redirect('/');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
