<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\Department;
use App\Models\PerformanceContract;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $year = now()->year;

        // ── Staff personal stats (cached 15 min) ─────────────────────────────
        $personal = Cache::remember("dashboard:staff:{$user->id}", 900, function () use ($user, $year) {
            $latest = Appraisal::with('total', 'period')
                ->where('user_id', $user->id)
                ->whereYear('submitted_at', $year)
                ->orderByDesc('submitted_at')
                ->first();

            $trend = Appraisal::with('total', 'period')
                ->where('user_id', $user->id)
                ->whereNotNull('submitted_at')
                ->orderBy('submitted_at')
                ->get()
                ->map(fn($a) => [
                    'name'  => $a->period?->label ?? $a->year,
                    'score' => $a->total?->grand_total ?? 0,
                ])
                ->filter(fn($p) => $p['score'] > 0)
                ->values();

            $contract = PerformanceContract::where('user_id', $user->id)
                ->where('year', $year)
                ->first();

            return [
                'latest_appraisal' => $latest ? [
                    'id'          => $latest->id,
                    'status'      => $latest->status,
                    'period'      => $latest->period?->label,
                    'grand_total' => $latest->total?->grand_total ?? 0,
                    'grade'       => $latest->total?->final_grade ?? null,
                ] : null,
                'score_trend'      => $trend,
                'contract_status'  => $contract?->status,
            ];
        });

        // ── Supervisor stats (cached 5 min) ───────────────────────────────────
        $supervisor = Cache::remember("dashboard:supervisor:{$user->id}", 300, function () use ($user) {
            $pending  = Appraisal::forSupervisor($user->id)->pendingReview()->count();
            $approved = Appraisal::forSupervisor($user->id)->where('status', 'approved')->count();
            $pendingContracts = PerformanceContract::where('supervisor_id', $user->id)
                ->where('status', 'pending_approval')->count();

            return compact('pending', 'approved', 'pendingContracts');
        });

        // ── Exec org-wide (cached 10 min) ─────────────────────────────────────
        $exec = null;
        if (in_array($user->getRoleNames()->first(), ['Deputy Director', 'National Coordinator', 'Super Admin'])) {
            $exec = Cache::remember("dashboard:exec:org_wide:{$year}", 600, function () use ($year) {
                return Department::all()->map(function ($dept) use ($year) {
                    // Join through users since appraisals don't store department_id directly
                    $userIds   = \App\Models\User::where('department_id', $dept->id)->pluck('id');
                    $total     = $userIds->count();
                    $submitted = Appraisal::whereIn('user_id', $userIds)
                        ->whereYear('submitted_at', $year)
                        ->whereNotIn('status', ['draft'])
                        ->count();
                    $pct = $total > 0 ? round(($submitted / $total) * 100) : 0;
                    return [
                        'dept_id'        => $dept->id,
                        'dept_name'      => $dept->name,
                        'dept_code'      => $dept->code,
                        'staff_count'    => $total,
                        'submitted'      => $submitted,
                        'compliance_pct' => $pct,
                    ];
                });
            });
        }

        return response()->json([
            'personal'   => $personal,
            'supervisor' => $supervisor,
            'exec'       => $exec,
        ]);
    }
}
