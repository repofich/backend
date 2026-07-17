<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Resources\CareerResource;
use App\Http\Resources\EvaluationResource;
use App\Http\Resources\ThesisResource;
use App\Http\Resources\UserResource;
use App\Models\Career;
use App\Models\Category;
use App\Models\PageVisit;
use App\Models\PaymentConcept;
use App\Models\Tag;
use App\Models\Thesis;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PageController
{
    public function home(Request $request)
    {
        $query = Thesis::with(['user', 'category', 'tags', 'files'])->where('status', 'publicado');

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

        $visitsByThesis = PageVisit::where('path', 'LIKE', 'tesis/%')
            ->get()
            ->keyBy(fn($pv) => (int) str_replace('tesis/', '', $pv->path));

        $thesisData = $theses->map(function ($thesis) use ($visitsByThesis) {
            return [
                'id' => $thesis->id,
                'titulo' => $thesis->title,
                'autores' => $thesis->user?->full_name ?? 'Sin autor',
                'carrera' => $thesis->category?->name ?? 'Sin categoría',
                'año' => (string) $thesis->created_at->year,
                'tipo' => $thesis->type ?? 'Tesis',
                'vistas' => $visitsByThesis->get($thesis->id)?->visits ?? 0,
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
        $tutors = User::where('user_type', 'docente')->get(['id', 'full_name']);
        $careers = Career::all(['id', 'name', 'format_config']);
        $defaultTypes = ['Tesis de Grado', 'Proyecto de Grado', 'Trabajo Dirigido', 'Pasantía', 'Adscripción'];
        $existingTypes = Thesis::whereNotNull('type')->distinct()->pluck('type');
        $types = collect($defaultTypes)->merge($existingTypes)->unique()->values();
        $tags = Tag::all();

        $formatConfig = Auth::user()->career?->format_config;

        return Inertia::render('CreateProject', [
            'categories' => $categories,
            'careers' => $careers,
            'tutors' => $tutors,
            'types' => $types,
            'tags' => $tags,
            'format_config' => $formatConfig ?? null,
        ]);
    }

    public function editProject(Thesis $thesis)
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $thesis->load(['user', 'category', 'tags', 'files', 'tutor']);

        $categories = Category::all();
        $careers = Career::all(['id', 'name', 'format_config']);
        $tutors = User::where('user_type', 'docente')->get(['id', 'full_name']);
        $defaultTypes = ['Tesis de Grado', 'Proyecto de Grado', 'Trabajo Dirigido', 'Pasantía', 'Adscripción'];
        $existingTypes = Thesis::whereNotNull('type')->distinct()->pluck('type');
        $types = collect($defaultTypes)->merge($existingTypes)->unique()->values();
        $tags = Tag::all();

        $formatConfig = $thesis->user->career?->format_config;

        return Inertia::render('EditProject', [
            'thesis' => $thesis->toArray(),
            'categories' => $categories,
            'careers' => $careers,
            'tutors' => $tutors,
            'types' => $types,
            'tags' => $tags,
            'format_config' => $formatConfig ?? null,
        ]);
    }

    public function myProjects()
    {
        $proyectos = Thesis::with(['category', 'tutor'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($thesis) {
                return [
                    'id' => $thesis->id,
                    'title' => $thesis->title,
                    'abstract' => $thesis->abstract,
                    'tutor' => $thesis->tutor,
                    'tutor_id' => $thesis->tutor_id,
                    'tutor_status' => $thesis->tutor_status,
                    'tutor_user' => $thesis->relationLoaded('tutor') && $thesis->tutor_id
                        ? [
                            'id' => $thesis->getRelation('tutor')->id,
                            'full_name' => $thesis->getRelation('tutor')->full_name,
                            'email' => $thesis->getRelation('tutor')->email,
                        ]
                        : null,
                    'repo_url' => $thesis->repo_url,
                    'demo_url' => $thesis->demo_url,
                    'featured' => $thesis->featured,
                    'type' => $thesis->type,
                    'status' => $thesis->status,
                    'category' => $thesis->relationLoaded('category') && $thesis->category
                        ? [
                            'id' => $thesis->category->id,
                            'name' => $thesis->category->name,
                        ]
                        : null,
                    'created_at' => $thesis->created_at,
                    'updated_at' => $thesis->updated_at,
                ];
            })
            ->values()
            ->all();

        $user = Auth::user();
        $token = $user ? auth('api')->login($user) : null;

        return Inertia::render('MyProjects', [
            'proyectos' => $proyectos,
            'jwt_token' => $token,
        ]);
    }

    public function payments(StripeService $stripe)
    {
        $user = auth()->user();
        $token = $user ? auth('api')->login($user) : null;

        $pendingTheses = [];
        $defenseFee = null;
        $paymentMethods = [];

        if ($user) {
            $pendingTheses = ThesisResource::collection(
                Thesis::with(['category', 'career'])
                    ->where('user_id', $user->id)
                    ->pendingDefensePayment()
                    ->latest()
                    ->get()
            )->resolve();

            $concept = PaymentConcept::active()
                ->byCode('defensa_tesis')
                ->forCareer($user->career_id)
                ->first();

            if ($concept) {
                $defenseFee = $concept->amount;
            }

            if ($user->stripe_customer_id) {
                $paymentMethods = $stripe->listPaymentMethods($user->stripe_customer_id);
            }
        }

        return Inertia::render('Payments', [
            'stripe_key' => config('stripe.key'),
            'jwt_token' => $token,
            'pending_theses' => $pendingTheses,
            'defense_fee' => $defenseFee,
            'payment_methods' => $paymentMethods,
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

        if ($thesis->status !== 'publicado') {
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

        $token = $user ? auth('api')->login($user) : null;

        $tribunalUsers = $user && in_array($user->user_type, ['vicedecano', 'director', 'admin'])
            ? User::where('user_type', 'tribunal')->get(['id', 'full_name', 'email'])
            : [];
        $tutorUsers = $user && in_array($user->user_type, ['vicedecano', 'director', 'admin'])
            ? User::where('user_type', 'docente')->get(['id', 'full_name', 'email'])
            : [];

        return Inertia::render('ThesisDetail', [
            'thesis' => ThesisResource::make($thesis)->resolve(),
            'jwt_token' => $token,
            'auth_user' => $user ? UserResource::make($user)->resolve() : null,
            'tribunal_users' => $tribunalUsers,
            'tutor_users' => $tutorUsers,
        ]);
    }

    public function misEvaluaciones()
    {
        $user = Auth::user();

        if (!in_array($user->user_type, ['tribunal', 'director', 'docente'])) {
            abort(403);
        }

        $theses = $user->user_type === 'docente'
            ? Thesis::with(['user', 'category', 'tutor'])
                ->where('tutor_id', $user->id)
                ->latest()
                ->get()
            : Thesis::with(['user', 'category', 'evaluations'])
                ->where('assigned_evaluator_id', $user->id)
                ->latest()
                ->get();

        $token = auth('api')->login($user);

        return Inertia::render('MisEvaluaciones', [
            'theses' => ThesisResource::collection($theses)->resolve(),
            'jwt_token' => $token,
            'mode' => $user->user_type === 'docente' ? 'tutorias' : 'evaluaciones',
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
        $tutorUsers = User::where('user_type', 'docente')->get(['id', 'full_name', 'email']);
        $careers = Career::all();
        $statuses = ['borrador', 'en_revision', 'observado', 'aprobado', 'rechazado', 'publicado'];

        $token = auth('api')->login($user);

        return Inertia::render('AdminTesis', [
            'theses' => ThesisResource::collection($theses)->resolve(),
            'tribunal_users' => $tribunalUsers,
            'tutor_users' => $tutorUsers,
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
            'tribunal' => 'Tribunal',
            'director' => 'Director',
            'vicedecano' => 'Vicedecano',
            'admin' => 'Administrador',
        ];

        $token = auth('api')->login($user);

        $directorCareerIds = User::where('user_type', 'director')
            ->whereNotNull('career_id')->pluck('career_id')->toArray();

        return Inertia::render('CreateUser', [
            'careers' => $careers,
            'user_types' => $userTypes,
            'jwt_token' => $token,
            'role_constraints' => [
                'vicedecano_taken' => User::where('user_type', 'vicedecano')->exists(),
                'director_career_ids' => $directorCareerIds,
            ],
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
            'tribunal' => 'Tribunal',
            'director' => 'Director',
            'vicedecano' => 'Vicedecano',
            'admin' => 'Administrador',
        ];

        $token = auth('api')->login($authUser);

        $directorCareerIds = User::where('user_type', 'director')
            ->whereNotNull('career_id')->where('id', '!=', $user->id)
            ->pluck('career_id')->toArray();

        return Inertia::render('EditUser', [
            'user' => UserResource::make($user)->resolve(),
            'careers' => $careers,
            'user_types' => $userTypes,
            'jwt_token' => $token,
            'role_constraints' => [
                'vicedecano_taken' => User::where('user_type', 'vicedecano')->where('id', '!=', $user->id)->exists(),
                'director_career_ids' => $directorCareerIds,
            ],
        ]);
    }

    public function adminCareers()
    {
        $user = Auth::user();

        if (!in_array($user->user_type, ['admin'])) {
            abort(403);
        }

        $careers = Career::with('director')->withCount('users')->latest()->get();
        $token = auth('api')->login($user);

        return Inertia::render('AdminCareers', [
            'careers' => CareerResource::collection($careers)->resolve(),
            'jwt_token' => $token,
        ]);
    }

    public function createCareer()
    {
        $user = Auth::user();

        if ($user->user_type !== 'admin') {
            abort(403);
        }

        $directors = User::where('user_type', '!=', 'estudiante')
            ->where('is_active', true)
            ->get(['id', 'full_name', 'email', 'user_type']);

        $token = auth('api')->login($user);

        return Inertia::render('CreateCareer', [
            'directors' => $directors,
            'jwt_token' => $token,
        ]);
    }

    public function editCareer(Career $career)
    {
        $user = Auth::user();

        if ($user->user_type !== 'admin') {
            abort(403);
        }

        $career->load('director');

        $directors = User::where('user_type', '!=', 'estudiante')
            ->where('is_active', true)
            ->get(['id', 'full_name', 'email', 'user_type']);

        $token = auth('api')->login($user);

        return Inertia::render('EditCareer', [
            'career' => CareerResource::make($career)->resolve(),
            'directors' => $directors,
            'jwt_token' => $token,
        ]);
    }

    public function adminReports()
    {
        $user = Auth::user();

        if (!in_array($user->user_type, ['vicedecano', 'director', 'admin'])) {
            abort(403);
        }

        $token = auth('api')->login($user);

        return Inertia::render('AdminReports', [
            'jwt_token' => $token,
        ]);
    }
}
