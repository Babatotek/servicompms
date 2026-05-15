<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /** GET /admin/users */
    public function index(Request $request)
    {
        $users = User::with('department:id,name,code')
            ->when($request->search, fn($q, $s) =>
                $q->where(fn($q) =>
                    $q->where('surname', 'like', "%{$s}%")
                      ->orWhere('firstname', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%")
                      ->orWhere('ippis_no', 'like', "%{$s}%")
                )
            )
            ->when($request->department_id, fn($q, $d) => $q->where('department_id', $d))
            ->when($request->role, fn($q, $r) => $q->role($r))
            ->orderBy('surname')
            ->paginate(50);

        return UserResource::collection($users);
    }

    /** POST /admin/users */
    public function store(Request $request)
    {
        $data = $request->validate([
            'firstname'         => 'required|string|max:100',
            'surname'           => 'required|string|max:100',
            'othername'         => 'nullable|string|max:100',
            'email'             => 'required|email|unique:users',
            'ippis_no'          => 'required|string|unique:users',
            'phone'             => 'nullable|string|max:20',
            'designation'       => 'required|string|max:200',
            'department_id'     => 'required|exists:departments,id',
            'supervisor_id'     => 'nullable|exists:users,id',
            'counter_signer_id' => 'nullable|exists:users,id',
            'role'              => 'required|string|exists:roles,name',
            'password'          => 'required|string|min:8',
        ]);

        $user = User::create(array_merge($data, [
            'password'  => Hash::make($data['password']),
            'is_active' => true,
        ]));

        $user->assignRole($data['role']);

        return new UserResource($user->load('department'));
    }

    /** PATCH /admin/users/{id} */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'firstname'         => 'sometimes|string|max:100',
            'surname'           => 'sometimes|string|max:100',
            'designation'       => 'sometimes|string|max:200',
            'department_id'     => 'sometimes|exists:departments,id',
            'supervisor_id'     => 'nullable|exists:users,id',
            'counter_signer_id' => 'nullable|exists:users,id',
            'is_active'         => 'sometimes|boolean',
            'role'              => 'sometimes|string|exists:roles,name',
        ]);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
            unset($data['role']);
        }

        $user->update($data);

        return new UserResource($user->load('department'));
    }
}
