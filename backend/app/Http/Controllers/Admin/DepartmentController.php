<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DepartmentController extends Controller
{
    public function index()
    {
        $data = Cache::remember('departments:all', 3600, function () {
            return Department::with('head:id,surname,firstname')->orderBy('name')->get();
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id'          => 'required|string|unique:departments',
            'name'        => 'required|string|max:200',
            'code'        => 'required|string|max:20|unique:departments',
            'unit_weight' => 'required|integer|min:0|max:50',
            'staff_count' => 'nullable|integer|min:0',
            'head_user_id'=> 'nullable|exists:users,id',
        ]);

        $dept = Department::create(array_merge($data, ['is_active' => true]));
        Cache::forget('departments:all');

        return response()->json(['data' => $dept], 201);
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:200',
            'unit_weight' => 'sometimes|integer|min:0|max:50',
            'staff_count' => 'sometimes|integer|min:0',
            'head_user_id'=> 'nullable|exists:users,id',
            'is_active'   => 'sometimes|boolean',
        ]);

        $department->update($data);
        Cache::forget('departments:all');

        return response()->json(['data' => $department]);
    }
}
