<?php

namespace App\Services;

use App\Models\Appraisal;
use App\Models\AppraisalKpiScore;
use App\Models\AppraisalCompetencyScore;
use App\Models\AppraisalOperationsScore;
use App\Models\AppraisalTotal;
use App\Models\GradeScale;
use App\Models\Competency;
use App\Models\OperationsItem;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ScoringService
{
    // Section weights — cached 24 hrs, matches frontend SECTION_WEIGHTS constant
    private function weights(): array
    {
        return Cache::remember('settings:section_weights', 86400, fn() => [
            'task'        => 70.0,
            'competency'  => 20.0,
            'operations'  => 10.0,
        ]);
    }

    private function gradeScales(): \Illuminate\Support\Collection
    {
        return Cache::remember('settings:grade_scales', 86400,
            fn() => GradeScale::active()->get()
        );
    }

    private function operationsMaxTotal(): int
    {
        return Cache::remember('settings:ops_max', 86400,
            fn() => OperationsItem::where('is_active', true)->sum('max_score')
        );
    }

    /**
     * Calculate and persist scores for an appraisal.
     * Called after all score rows are saved.
     */
    public function calculate(Appraisal $appraisal): AppraisalTotal
    {
        $appraisal->load(['kpiScores.kpi', 'competencyScores.competency', 'operationsScores']);
        $weights = $this->weights();

        // ── Section 4: Task Performance (70%) ────────────────────────────────
        // Formula: sum of (graded_weight * raw_score / 100), then scale to 70%
        $section4Raw = $appraisal->kpiScores->sum(function ($score) {
            $gradedWeight = $score->kpi?->graded_weight ?? 0;
            return ($gradedWeight * $score->raw_score) / 100;
        });
        $section4 = ($section4Raw / 100) * $weights['task'];

        // ── Section 5: Competencies (20%) ─────────────────────────────────────
        // Formula: sum of (score / 5 * item_target_weight)
        $section5 = $appraisal->competencyScores->sum(function ($score) {
            $target = $score->competency?->default_target ?? 0;
            return ($score->score / 5) * $target;
        });

        // ── Section 6: Operations (10%) ───────────────────────────────────────
        $opsTotal = $appraisal->operationsScores->sum('score');
        $opsMax   = $this->operationsMaxTotal();
        $section6 = $opsMax > 0 ? ($opsTotal / $opsMax) * $weights['operations'] : 0;

        $grandTotal = min(100, round($section4 + $section5 + $section6, 2));
        $grade      = $this->toGrade($grandTotal);

        // Upsert into appraisal_totals (unique on appraisal_id)
        $total = AppraisalTotal::updateOrCreate(
            ['appraisal_id' => $appraisal->id],
            [
                'section_4_score' => round($section4, 2),
                'section_5_score' => round($section5, 2),
                'section_6_score' => round($section6, 2),
                'grand_total'     => $grandTotal,
                'final_grade'     => $grade,
            ]
        );

        return $total;
    }

    /**
     * Compute raw_score and grade_key for a single KPI achievement.
     * Mirrors the Excel IF-chain in AppraisalForm.tsx calculateScores().
     */
    public function scoreKpi(float $achievement, array $criteria, string $direction): array
    {
        if ($achievement <= 0) {
            return ['raw_score' => 0, 'grade_key' => 'P'];
        }

        $o  = (float) ($criteria['O']  ?? 0);
        $e  = (float) ($criteria['E']  ?? 0);
        $vg = (float) ($criteria['VG'] ?? 0);
        $g  = (float) ($criteria['G']  ?? 0);
        $f  = (float) ($criteria['F']  ?? 0);

        if ($direction === 'higher') {
            if ($achievement < $f)  return ['raw_score' => 50,  'grade_key' => 'P'];
            if ($achievement < $g)  return ['raw_score' => 60,  'grade_key' => 'F'];
            if ($achievement < $vg) return ['raw_score' => 70,  'grade_key' => 'G'];
            if ($achievement < $e)  return ['raw_score' => 80,  'grade_key' => 'VG'];
            if ($o > 0) {
                if ($achievement < $o) return ['raw_score' => 90, 'grade_key' => 'E'];
                return ['raw_score' => 100, 'grade_key' => 'O'];
            }
            return $achievement === $e
                ? ['raw_score' => 90, 'grade_key' => 'E']
                : ['raw_score' => 100, 'grade_key' => 'O'];
        }

        // direction === 'lower' (e.g. turnaround time — lower is better)
        if ($achievement > $f)  return ['raw_score' => 50,  'grade_key' => 'P'];
        if ($achievement > $g)  return ['raw_score' => 60,  'grade_key' => 'F'];
        if ($achievement > $vg) return ['raw_score' => 70,  'grade_key' => 'G'];
        if ($achievement > $e)  return ['raw_score' => 80,  'grade_key' => 'VG'];
        if ($o > 0) {
            if ($achievement > $o) return ['raw_score' => 90, 'grade_key' => 'E'];
            return ['raw_score' => 100, 'grade_key' => 'O'];
        }
        return $achievement === $e
            ? ['raw_score' => 90, 'grade_key' => 'E']
            : ['raw_score' => 100, 'grade_key' => 'O'];
    }

    public function toGrade(float $score): string
    {
        foreach ($this->gradeScales() as $grade) {
            if ($score >= $grade->threshold_percent) {
                return $grade->key;
            }
        }
        return 'P';
    }
}
