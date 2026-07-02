<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Requests\StoreThesisWebRequest;
use App\Models\Thesis;
use App\Models\ThesisFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ThesisController
{
    public function store(StoreThesisWebRequest $request): RedirectResponse
    {
        $thesis = Thesis::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        if ($request->has('tags')) {
            $thesis->tags()->sync($request->tags);
        }

        return redirect('/mis-proyectos');
    }

    public function update(StoreThesisWebRequest $request, Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $thesis->update($request->validated());

        if ($request->has('tags')) {
            $thesis->tags()->sync($request->tags);
        }

        return redirect('/mis-proyectos');
    }

    public function destroy(Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $thesis->tags()->detach();

        foreach ($thesis->files as $file) {
            Storage::disk('public')->delete($file->file_path);
        }

        $thesis->files()->delete();
        $thesis->delete();

        return redirect('/mis-proyectos');
    }

    public function uploadFile(Request $request, Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,png,jpeg,zip', 'max:20480'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $path = $request->file('file')->store('thesis/' . $thesis->id, 'public');

        $thesis->files()->create([
            'file_path' => $path,
            'is_primary' => $request->boolean('is_primary'),
        ]);

        return redirect()->back();
    }

    public function deleteFile(Thesis $thesis, ThesisFile $file): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return redirect()->back();
    }
}
