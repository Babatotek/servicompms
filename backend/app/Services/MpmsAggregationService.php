<?php

namespace App\Services;

use App\Models\MpmsPriorityCategory;
use Illuminate\Support\Facades\Cache;

class MpmsAggregationService
{
    /**
     * Returns category scores for the MPMS dashboard.
     * Cached per year — invalidated when any achievement is saved.
     */
    public function categoryScores(int $year): array
    {
        return Cache::remember("mpms:category_scores:{$year}", 1800, function () use ($year) {
            $categories = MpmsPriorityCategory::with([
                'kras.objectives.kpis.achievements' => fn($q) => $q->where('year', $year),
            ])->orderBy('sort_order')->get();

            return $categories->map(function ($cat) use ($year) {
                $allKpiIds = $cat->kras->flatMap(
                    fn($kra) => $kra->objectives->flatMap(
                        fn($obj) => $obj->kpis->pluck('id')
                    )
                );

                $achievements = $cat->kras->flatMap(
                    fn($kra) => $kra->objectives->flatMap(
                        fn($obj) => $obj->kpis->flatMap(fn($kpi) => $kpi->achievements)
                    )
                )->filter();

                $avg = $achievements->count() > 0
                    ? round($achievements->avg('achievement_value'), 1)
                    : 0;

                $weightedScore = ($avg / 100) * $cat->weight_percent;

                return [
                    'id'             => $cat->id,
                    'code'           => $cat->code,
                    'name'           => $cat->name,
                    'weight'         => $cat->weight_percent,
                    'score'          => $avg,
                    'kpi_count'      => $allKpiIds->count(),
                    'submitted_count'=> $achievements->count(),
                    'weighted_score' => round($weightedScore, 2),
                ];
            })->toArray();
        });
    }

    public function institutionalScore(int $year): float
    {
        return Cache::remember("mpms:institutional_score:{$year}", 1800, function () use ($year) {
            $scores = $this->categoryScores($year);
            $totalWeight   = array_sum(array_column($scores, 'weight'));
            $achievedWeight = array_sum(array_column($scores, 'weighted_score'));
            return $totalWeight > 0 ? round(($achievedWeight / $totalWeight) * 100, 1) : 0;
        });
    }

    public function bustCache(int $year): void
    {
        Cache::forget("mpms:category_scores:{$year}");
        Cache::forget("mpms:institutional_score:{$year}");
    }
}
