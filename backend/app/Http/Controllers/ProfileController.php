<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /** PATCH /profile — update own profile fields */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'firstname'  => 'sometimes|string|max:100',
            'surname'    => 'sometimes|string|max:100',
            'othername'  => 'nullable|string|max:100',
            'phone'      => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|max:500',
        ]);

        $user->update($data);

        return new UserResource($user->load('department'));
    }

    /** PATCH /profile/password — change own password */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
