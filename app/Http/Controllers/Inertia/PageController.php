<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Resources\CareerResource;
use App\Models\Career;
use App\Models\Thesis;
use Illuminate\Http\Request;
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
        return Inertia::render('CreateProject');
    }
}
