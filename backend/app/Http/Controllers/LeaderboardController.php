<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\Department;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    /** GET /leaderboard/annual/{year} — approved appraisals, best score per user */
    public function annual(int $year)
    {
        $data = Cache::remember("leaderboard:annual:{$year}", 600, function () use ($year) {
            return Appraisal::with([
                    'user:id,surname,firstname,department_id',
                    'user.department:id,name,code',
                    'total:appraisal_id,grand_total,final_grade',
                ])
                ->approved()
                ->where('year', $year)
                ->get()
                ->groupBy('user_id')
                ->map(fn($group) => $group->sortByDesc(fn($a) => $a->total?->grand_total ?? 0)->first())
                ->filter(fn($a) => ($a->total?->grand_total ?? 0) > 0)
                ->sortByDesc(fn($a) => $a->total?->grand_total ?? 0)
                ->values()
                ->map(fn($a) => [
                    'user_id'       => $a->user_id,
                    'user_name'     => $a->user?->full_name,
                    'department_id' => $a->user?->department_id,
                    'department'    => $a->user?->department?->name,
                    'score'         => round($a->total?->grand_total ?? 0, 1),
                    'grade'         => $a->total?->final_grade,
                ]);
        });

        return response()->json(['data' => $data]);
    }

    /** GET /leaderboard/quarter/{year}  — latest submitted per user regardless of status */
    public function quarter(int $year)
    {
        $data = Cache::remember("leaderboard:quarter:{$year}", 300, function () use ($year) {
            return Appraisal::with([
                    'user:id,surname,firstname,department_id',
                    'user.department:id,name,code',
                    'total:appraisal_id,grand_total,final_grade',
                ])
                ->where('year', $year)
                ->whereNotNull('submitted_at')
                ->get()
                ->groupBy('user_id')
                ->map(fn($g) => $g->sortByDesc('submitted_at')->first())
                ->filter(fn($a) => ($a->total?->grand_total ?? 0) > 0)
                ->sortByDesc(fn($a) => $a->total?->grand_total ?? 0)
                ->values()
                ->map(fn($a) => [
                    'user_id'       => $a->user_id,
                    'user_name'     => $a->user?->full_name,
                    'department_id' => $a->user?->department_id,
                    'score'         => round($a->total?->grand_total ?? 0, 1),
                    'grade'         => $a->total?->final_grade,
                ]);
        });

        return response()->json(['data' => $data]);
    }

    /** GET /leaderboard/departments/{year} — avg score per department */
    public function departments(int $year)
    {
        $data = Cache::remember("leaderboard:dept:{$year}", 600, function () use ($year) {
            $depts = Department::all()->keyBy('id');

            return Appraisal::with([
                    'user:id,department_id',
                    'total:appraisal_id,grand_total,final_grade',
                ])
                ->approved()
                ->where('year', $year)
                ->get()
                ->groupBy(fn($a) => $a->user?->department_id)
                ->map(function ($group, $deptId) use ($depts) {
                    $scores = $group->map(fn($a) => $a->total?->grand_total ?? 0)->filter();
                    $avg    = $scores->count() > 0 ? round($scores->avg(), 1) : 0;
                    $dept   = $depts[$deptId] ?? null;
                    return [
                        'dept_id' => $deptId,
                        'name'    => $dept?->name ?? $deptId,
                        'code'    => $dept?->code,
                        'score'   => $avg,
                        'count'   => $scores->count(),
                    ];
                })
                ->sortByDesc('score')
                ->values();
        });

        return response()->json(['data' => $data]);
    }
}
