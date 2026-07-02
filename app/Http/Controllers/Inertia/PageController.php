<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Resources\CareerResource;
use App\Http\Resources\EvaluationResource;
use App\Http\Resources\ThesisResource;
use App\Http\Resources\UserResource;
use App\Models\Career;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Thesis;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PageController
{
    public function home(Request $request)
    {
        $query = Thesis::with(['user', 'category', 'tags', 'files']);

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
                $q->where('name', $request->career);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $theses = $query->latest()->get();

        $thesisData = $theses->map(function ($thesis) {
            return [
                'id' => $thesis->id,
                'titulo' => $thesis->title,
                'autores' => $thesis->user?->full_name ?? 'Sin autor',
                'carrera' => $thesis->category?->name ?? 'Sin categoría',
                'año' => (string) $thesis->created_at->year,
                'tipo' => $thesis->type ?? 'Tesis',
                'vistas' => 0,
                'imagen' => null,
            ];
        });

        $years = Thesis::selectRaw('EXTRACT(YEAR FROM created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn($y) => (string) $y);

        $types = Thesis::whereNotNull('type')->distinct()->pluck('type');

        $careers = Career::all();
        $careerNames = $careers->pluck('name');
        $careerOptions = CareerResource::collection($careers);

        return Inertia::render('Home', [
            'publicaciones' => $thesisData,
            'filterOptions' => [
                'años' => $years,
                'carreras' => $careerNames,
                'tipos' => $types,
            ],
            'filters' => $request->only(['query', 'year', 'career', 'type']),
        ]);
    }

    public function login()
    {
        return Inertia::render('Login');
    }

    public function register()
    {
        $careers = Career::all()->toArray();

        return Inertia::render('Register', [
            'careers' => $careers,
        ]);
    }

    public function createProject()
    {
        $categories = Category::all();
        $tutors = User::where('user_type', 'tutor')->get(['id', 'full_name']);
        $defaultTypes = ['Tesis de Grado', 'Proyecto de Grado', 'Trabajo Dirigido', 'Pasantía', 'Adscripción'];
        $existingTypes = Thesis::whereNotNull('type')->distinct()->pluck('type');
        $types = collect($defaultTypes)->merge($existingTypes)->unique()->values();
        $tags = Tag::all();

        return Inertia::render('CreateProject', [
            'categories' => $categories,
            'tutors' => $tutors,
            'types' => $types,
            'tags' => $tags,
        ]);
    }

    public function editProject(Thesis $thesis)
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $thesis->load(['user', 'category', 'tags', 'files', 'tutor']);

        $categories = Category::all();
        $tutors = User::where('user_type', 'tutor')->get(['id', 'full_name']);
        $defaultTypes = ['Tesis de Grado', 'Proyecto de Grado', 'Trabajo Dirigido', 'Pasantía', 'Adscripción'];
        $existingTypes = Thesis::whereNotNull('type')->distinct()->pluck('type');
        $types = collect($defaultTypes)->merge($existingTypes)->unique()->values();
        $tags = Tag::all();

        return Inertia::render('EditProject', [
            'thesis' => $thesis->toArray(),
            'categories' => $categories,
            'tutors' => $tutors,
            'types' => $types,
            'tags' => $tags,
        ]);
    }

    public function myProjects()
    {
        $proyectos = Thesis::with('category')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->toArray();

        $user = Auth::user();
        $token = $user ? auth('api')->login($user) : null;

        return Inertia::render('MyProjects', [
            'proyectos' => $proyectos,
            'jwt_token' => $token,
        ]);
    }

    public function payments()
    {
        $user = auth()->user();
        $token = $user ? auth('api')->login($user) : null;

        return Inertia::render('Payments', [
            'stripe_key' => config('stripe.key'),
            'jwt_token' => $token,
        ]);
    }

    public function profile()
    {
        $user = Auth::user()->load('career');
        $careers = Career::all()->toArray();

        return Inertia::render('Profile', [
            'user' => UserResource::make($user)->resolve(),
            'careers' => $careers,
        ]);
    }

    public function thesisDetail(Thesis $thesis)
    {
        $thesis->load(['user.career', 'tutor', 'category', 'tags', 'files', 'assignedEvaluator', 'evaluations.evaluator']);

        $user = Auth::user();
        $token = $user ? auth('api')->login($user) : null;

        $tribunalUsers = $user && in_array($user->user_type, ['vicedecano', 'director', 'admin'])
            ? User::where('user_type', 'tribunal')->get(['id', 'full_name', 'email'])
            : [];

        return Inertia::render('ThesisDetail', [
            'thesis' => ThesisResource::make($thesis)->resolve(),
            'jwt_token' => $token,
            'auth_user' => $user ? UserResource::make($user)->resolve() : null,
            'tribunal_users' => $tribunalUsers,
        ]);
    }

    public function misEvaluaciones()
    {
        $user = Auth::user();

        if (!in_array($user->user_type, ['tribunal', 'director'])) {
            abort(403);
        }

        $theses = Thesis::with(['user', 'category', 'evaluations'])
            ->where('assigned_evaluator_id', $user->id)
            ->latest()
            ->get();

        $token = auth('api')->login($user);

        return Inertia::render('MisEvaluaciones', [
            'theses' => ThesisResource::collection($theses)->resolve(),
            'jwt_token' => $token,
        ]);
    }

    public function evaluarTesis(Thesis $thesis)
    {
        $user = Auth::user();

        if ($user->id !== $thesis->assigned_evaluator_id) {
            abort(403);
        }

        $thesis->load(['user', 'category', 'tags', 'files', 'evaluations' => function ($q) use ($user) {
            $q->where('evaluator_id', $user->id);
        }, 'evaluations.evaluator']);

        $token = auth('api')->login($user);

        return Inertia::render('EvaluarTesis', [
            'thesis' => ThesisResource::make($thesis)->resolve(),
            'evaluation' => $thesis->evaluations->isNotEmpty()
                ? EvaluationResource::make($thesis->evaluations->first())->resolve()
                : null,
            'jwt_token' => $token,
        ]);
    }

    public function adminTesis(Request $request)
    {
        $user = Auth::user();

        if (!in_array($user->user_type, ['vicedecano', 'director', 'admin'])) {
            abort(403);
        }

        $query = Thesis::with(['user', 'category', 'assignedEvaluator', 'tutor', 'evaluations.evaluator']);

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }

        if ($request->filled('author')) {
            $query->whereHas('user', fn($q) => $q->where('full_name', 'like', '%' . $request->author . '%'));
        }

        if ($request->filled('career')) {
            $query->whereHas('category', fn($q) => $q->where('name', $request->career));
        }

        if ($request->filled('tutor')) {
            $query->whereHas('tutor', fn($q) => $q->where('full_name', 'like', '%' . $request->tutor . '%'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $theses = $query->latest()->get();

        $tribunalUsers = User::where('user_type', 'tribunal')->get(['id', 'full_name', 'email']);
        $careers = Career::all();
        $statuses = ['borrador', 'en_revision', 'observado', 'aprobado', 'rechazado', 'publicado'];

        $token = auth('api')->login($user);

        return Inertia::render('AdminTesis', [
            'theses' => ThesisResource::collection($theses)->resolve(),
            'tribunal_users' => $tribunalUsers,
            'filters' => $request->only(['title', 'author', 'career', 'tutor', 'status']),
            'filterOptions' => [
                'careers' => $careers->pluck('name'),
                'statuses' => $statuses,
            ],
            'jwt_token' => $token,
        ]);
    }

    public function adminUsers(Request $request)
    {
        $user = Auth::user();

        if ($user->user_type !== 'admin') {
            abort(403);
        }

        $query = User::with('career');

        if ($request->filled('query')) {
            $s = $request->query;
            $query->where(function ($q) use ($s) {
                $q->where('full_name', 'like', '%' . $s . '%')
                    ->orWhere('email', 'like', '%' . $s . '%')
                    ->orWhere('ci', 'like', '%' . $s . '%');
            });
        }

        if ($request->filled('user_type')) {
            $query->where('user_type', $request->user_type);
        }

        $users = $query->latest()->get();

        $userTypes = [
            'estudiante' => 'Estudiante',
            'docente' => 'Docente',
            'tutor' => 'Tutor',
            'tribunal' => 'Tribunal',
            'director' => 'Director',
            'vicedecano' => 'Vicedecano',
            'admin' => 'Administrador',
        ];

        $careers = Career::all();
        $token = auth('api')->login($user);

        return Inertia::render('AdminUsers', [
            'users' => UserResource::collection($users)->resolve(),
            'filters' => $request->only(['query', 'user_type']),
            'filterOptions' => [
                'user_types' => $userTypes,
            ],
            'jwt_token' => $token,
        ]);
    }

    public function createUser()
    {
        $user = Auth::user();

        if ($user->user_type !== 'admin') {
            abort(403);
        }

        $careers = Career::all();
        $userTypes = [
            'docente' => 'Docente',
            'tutor' => 'Tutor',
            'tribunal' => 'Tribunal',
            'director' => 'Director',
            'vicedecano' => 'Vicedecano',
            'admin' => 'Administrador',
        ];

        $token = auth('api')->login($user);

        return Inertia::render('CreateUser', [
            'careers' => $careers,
            'user_types' => $userTypes,
            'jwt_token' => $token,
        ]);
    }

    public function editUser(User $user)
    {
        $authUser = Auth::user();

        if ($authUser->user_type !== 'admin') {
            abort(403);
        }

        $user->load('career');

        $careers = Career::all();
        $userTypes = [
            'estudiante' => 'Estudiante',
            'docente' => 'Docente',
            'tutor' => 'Tutor',
            'tribunal' => 'Tribunal',
            'director' => 'Director',
            'vicedecano' => 'Vicedecano',
            'admin' => 'Administrador',
        ];

        $token = auth('api')->login($authUser);

        return Inertia::render('EditUser', [
            'user' => UserResource::make($user)->resolve(),
            'careers' => $careers,
            'user_types' => $userTypes,
            'jwt_token' => $token,
        ]);
    }
}
