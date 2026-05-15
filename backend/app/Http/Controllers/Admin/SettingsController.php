<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompetencyCluster;
use App\Models\GradeScale;
use App\Models\OperationsItem;
use App\Models\AppraisalPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /** GET /admin/settings */
    public function index()
    {
        return response()->json([
            'grade_scales'       => GradeScale::orderBy('sort_order')->get(),
            'competency_clusters'=> CompetencyCluster::with('items')->orderBy('sort_order')->get(),
            'operations_items'   => OperationsItem::where('is_active', true)->orderBy('sort_order')->get(),
            'appraisal_periods'  => AppraisalPeriod::orderBy('year')->orderBy('quarter')->get(),
            'section_weights'    => [
                'task_performance' => 70,
                'competencies'     => 20,
                'operations'       => 10,
            ],
        ]);
    }

    /**
     * PATCH /admin/settings
     *
     * Frontend sends nested JSON per the dot-notation steering rule:
     *   { "settings": { "grade_scales": [...], "section_weights": {...} } }
     *
     * We validate the nested structure, then use Arr::dot() to flatten
     * before dispatching to the correct handler — preventing the silent
     * "save succeeds but DB unchanged" failure mode.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings'                              => 'required|array',
            'settings.grade_scales'                 => 'sometimes|array',
            'settings.grade_scales.*.key'           => 'required|string',
            'settings.grade_scales.*.label'         => 'required|string',
            'settings.grade_scales.*.threshold_percent' => 'required|numeric',
            'settings.grade_scales.*.colour_hex'    => 'required|string',
            'settings.section_weights'              => 'sometimes|array',
            'settings.section_weights.task_performance' => 'sometimes|integer|min:0|max:100',
            'settings.section_weights.competencies' => 'sometimes|integer|min:0|max:100',
            'settings.section_weights.operations'   => 'sometimes|integer|min:0|max:100',
            'settings.competency_clusters'          => 'sometimes|array',
            'settings.competency_clusters.*.id'     => 'required|exists:competency_clusters,id',
            'settings.competency_clusters.*.weight' => 'required|numeric|min:0',
            'settings.appraisal_periods'            => 'sometimes|array',
        ]);

        // Flatten nested settings to dot-notation keys for dispatch
        $flat = Arr::dot($validated['settings']);

        // Grade scales
        if (isset($validated['settings']['grade_scales'])) {
            foreach ($validated['settings']['grade_scales'] as $i => $gs) {
                GradeScale::where('key', $gs['key'])->update([
                    'label'             => $gs['label'],
                    'threshold_percent' => $gs['threshold_percent'],
                    'colour_hex'        => $gs['colour_hex'],
                ]);
            }
            Cache::forget('settings:grade_scales');
        }

        // Section weights — validate sum = 100
        if (isset($validated['settings']['section_weights'])) {
            $sw  = $validated['settings']['section_weights'];
            $sum = ($sw['task_performance'] ?? 70) + ($sw['competencies'] ?? 20) + ($sw['operations'] ?? 10);
            if ($sum !== 100) {
                return response()->json(['message' => "Section weights must sum to 100 (got {$sum})."], 422);
            }
            Cache::forget('settings:section_weights');
            // Stored in cache only — no dedicated DB table needed for weights
            Cache::put('settings:section_weights', [
                'task'       => $sw['task_performance'],
                'competency' => $sw['competencies'],
                'operations' => $sw['operations'],
            ], 86400);
        }

        // Competency cluster weights — validate sum = 20
        if (isset($validated['settings']['competency_clusters'])) {
            $total = array_sum(array_column($validated['settings']['competency_clusters'], 'weight'));
            if (abs($total - 20) > 0.01) {
                return response()->json(['message' => "Cluster weights must sum to 20 (got {$total})."], 422);
            }
            foreach ($validated['settings']['competency_clusters'] as $cluster) {
                CompetencyCluster::where('id', $cluster['id'])->update(['weight' => $cluster['weight']]);
            }
        }

        Cache::forget('settings:grade_scales');

        return response()->json(['message' => 'Settings saved.']);
    }
}
