<?php

namespace App\Http\Controllers\Inertia;

use App\Models\Thesis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThesisController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'abstract' => ['required', 'string'],
            'tutor' => ['required', 'string', 'max:255'],
            'tutor_id' => ['nullable', 'integer', 'exists:users,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'type' => ['nullable', 'string', 'max:100'],
            'repo_url' => ['nullable', 'string', 'url', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'url', 'max:2048'],
        ]);

        $validated['user_id'] = Auth::id();

        Thesis::create($validated);

        return redirect('/');
    }
}
