<?php

namespace App\Http\Controllers;

use App\Models\Appraisal;
use App\Models\Department;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    /** GET /analytics/me */
    public function me()
    {
        $userId = auth()->id();
        $year   = now()->year;

        $trend = Cache::remember("analytics:score_trend:{$userId}", 900, function () use ($userId) {
            return Appraisal::with('total:appraisal_id,grand_total', 'period:id,label')
                ->where('user_id', $userId)
                ->whereNotNull('submitted_at')
                ->orderBy('submitted_at')
                ->get()
                ->filter(fn($a) => ($a->total?->grand_total ?? 0) > 0)
                ->map(fn($a) => [
                    'name'  => $a->period?->label ?? (string) $a->year,
                    'score' => round($a->total->grand_total, 2),
                ])
                ->values();
        });

        $kra = Cache::remember("analytics:kra_breakdown:{$userId}", 900, function () use ($userId) {
            $latest = Appraisal::with([
                    'contract.krasWithTree',
                    'kpiScores',
                    'total',
                ])
                ->where('user_id', $userId)
                ->orderByDesc('submitted_at')
                ->first();

            if (! $latest) return [];

            return $latest->contract?->kras->map(function ($kra) use ($latest) {
                $kpiIds = $kra->objectives->flatMap(fn($o) => $o->kpis->pluck('id'));
                $scores = $latest->kpiScores->whereIn('kpi_id', $kpiIds);
                $avg    = $scores->count() > 0 ? round($scores->avg('achievement'), 1) : 0;
                return [
                    'name'   => $kra->name,
                    'weight' => $kra->weight,
                    'score'  => $avg,
                ];
            }) ?? [];
        });

        return response()->json(['trend' => $trend, 'kra_breakdown' => $kra]);
    }

    /** GET /analytics/org  — exec only */
    public function org()
    {
        $year = now()->year;

        $data = Cache::remember("analytics:org_compliance:{$year}", 600, function () use ($year) {
            return Department::all()->map(function ($dept) use ($year) {
                $userIds  = \App\Models\User::where('department_id', $dept->id)->pluck('id');
                $total    = Appraisal::whereIn('user_id', $userIds)->where('year', $year)->count();
                $approved = Appraisal::whereIn('user_id', $userIds)->where('year', $year)->approved()->count();
                $avgScore = Appraisal::whereIn('user_id', $userIds)
                    ->where('year', $year)
                    ->approved()
                    ->join('appraisal_totals', 'appraisals.id', '=', 'appraisal_totals.appraisal_id')
                    ->avg('appraisal_totals.grand_total');

                return [
                    'dept_id'   => $dept->id,
                    'name'      => $dept->name,
                    'code'      => $dept->code,
                    'total'     => $total,
                    'approved'  => $approved,
                    'pct'       => $total > 0 ? round(($approved / $total) * 100) : 0,
                    'avg_score' => $avgScore ? round($avgScore, 1) : 0,
                ];
            });
        });

        return response()->json(['data' => $data]);
    }
}
