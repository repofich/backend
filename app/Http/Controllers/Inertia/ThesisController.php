<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Requests\StoreThesisWebRequest;
use App\Models\Tag;
use App\Models\Thesis;
use App\Models\ThesisFile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ThesisController
{
    public function store(StoreThesisWebRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $tutor = User::where('user_type', 'tutor')->findOrFail($data['tutor_id']);

        $thesis = Thesis::create([
            ...collect($data)->except(['tags', 'keywords'])->all(),
            'tutor' => $data['tutor'] ?? $tutor->full_name,
            'tutor_status' => 'pending',
            'user_id' => Auth::id(),
        ]);

        $this->syncKeywords($thesis, $data);

        return redirect('/mis-proyectos');
    }

    public function update(StoreThesisWebRequest $request, Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validated();

        if (!empty($data['tutor_id']) && (int) $data['tutor_id'] !== $thesis->tutor_id) {
            $tutor = User::where('user_type', 'tutor')->findOrFail($data['tutor_id']);
            $data['tutor'] = $data['tutor'] ?? $tutor->full_name;
            $data['tutor_status'] = 'pending';
        }

        $thesis->update(collect($data)->except(['tags', 'keywords'])->all());

        $this->syncKeywords($thesis, $data);

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

    private function syncKeywords(Thesis $thesis, array $data): void
    {
        if (array_key_exists('keywords', $data)) {
            $tagIds = collect($data['keywords'])
                ->map(fn($keyword) => trim(preg_replace('/\s+/', ' ', $keyword)))
                ->filter()
                ->unique(fn($keyword) => strtolower($keyword))
                ->map(function ($keyword) {
                    return Tag::whereRaw('LOWER(name) = ?', [strtolower($keyword)])->first()
                        ?? Tag::create(['name' => $keyword]);
                })
                ->pluck('id')
                ->values()
                ->all();

            $thesis->tags()->sync($tagIds);
            return;
        }

        if (array_key_exists('tags', $data)) {
            $thesis->tags()->sync($data['tags']);
        }
    }
}
