<?php

namespace App\Http\Controllers\Inertia;

use App\Http\Requests\ProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController
{
    public function update(ProfileRequest $request): RedirectResponse
    {
        $user = Auth::user();

        $user->update($request->safe()->except(['photo', 'curriculum']));

        if ($request->hasFile('photo')) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $path = $request->file('photo')->store('users/' . $user->id, 'public');
            $user->update(['photo_path' => $path]);
        }

        if ($request->hasFile('curriculum')) {
            if ($user->curriculum_pdf_path) {
                Storage::disk('public')->delete($user->curriculum_pdf_path);
            }

            $path = $request->file('curriculum')->store('users/' . $user->id, 'public');
            $user->update(['curriculum_pdf_path' => $path]);
        }

        return redirect('/perfil');
    }
}
