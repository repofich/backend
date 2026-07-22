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
        $tutor = User::where('user_type', 'docente')->findOrFail($data['tutor_id']);

        $thesis = Thesis::create([
            ...collect($data)->except(['tags', 'keywords', 'files'])->all(),
            'tutor' => $data['tutor'] ?? $tutor->full_name,
            'tutor_status' => 'pending',
            'user_id' => Auth::id(),
        ]);

        $this->syncKeywords($thesis, $data);
        $this->storeFiles($thesis, $data);

        return redirect('/mis-proyectos');
    }

    public function update(StoreThesisWebRequest $request, Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        if (!in_array($thesis->status, ['borrador', 'observado'])) {
            return redirect()->back()->withErrors(['status' => 'Solo se puede editar tesis en estado borrador u observado.']);
        }

        $data = $request->validated();

        if (!empty($data['tutor_id']) && (int) $data['tutor_id'] !== $thesis->tutor_id) {
            $tutor = User::where('user_type', 'docente')->findOrFail($data['tutor_id']);
            $data['tutor'] = $data['tutor'] ?? $tutor->full_name;
            $data['tutor_status'] = 'pending';
        }

        $thesis->update(collect($data)->except(['tags', 'keywords', 'files'])->all());

        $this->syncKeywords($thesis, $data);
        $this->storeFiles($thesis, $data);

        return redirect('/mis-proyectos');
    }

    public function destroy(Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $thesis->delete();

        return redirect('/mis-proyectos')->with('success', 'Tesis enviada a la papelera. Se eliminará definitivamente después de 30 días.');
    }

    public function uploadFile(Request $request, Thesis $thesis): RedirectResponse
    {
        if ($thesis->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'file' => ['sometimes', 'file', 'mimes:pdf,doc,docx,jpg,png,jpeg,zip', 'max:20480'],
            'files' => ['sometimes', 'array'],
            'files.*' => ['file', 'mimes:pdf,doc,docx,jpg,png,jpeg,zip', 'max:20480'],
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $name = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('thesis/' . $thesis->id, $name, 'public');
            $thesis->files()->create(['file_path' => $path, 'is_primary' => false]);
        }

        if ($request->hasFile('files')) {
            $i = 0;
            foreach ($request->file('files') as $file) {
                $name = time() . '_' . ($i++) . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('thesis/' . $thesis->id, $name, 'public');
                $thesis->files()->create(['file_path' => $path, 'is_primary' => false]);
            }
        }

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

    private function storeFiles(Thesis $thesis, array $data): void
    {
        if (!isset($data['files']) || !is_array($data['files'])) {
            return;
        }

        $i = 0;
        foreach ($data['files'] as $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $name = time() . '_' . ($i++) . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('thesis/' . $thesis->id, $name, 'public');
                $thesis->files()->create(['file_path' => $path, 'is_primary' => false]);
            }
        }
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
