<?php

namespace App\Http\Controllers;

use App\Models\MpmsAchievement;
use App\Models\MpmsKpi;
use App\Services\MpmsAggregationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MpmsController extends Controller
{
    public function __construct(private MpmsAggregationService $aggregation) {}

    /** GET /mpms/dashboard/{year} */
    public function dashboard(int $year)
    {
        return response()->json([
            'institutional_score' => $this->aggregation->institutionalScore($year),
            'category_scores'     => $this->aggregation->categoryScores($year),
        ]);
    }

    /** GET /mpms/kpis  — full library, cached 24 hrs */
    public function kpis()
    {
        $kpis = Cache::remember('mpms:kpis:all', 86400, function () {
            return MpmsKpi::with([
                'objective.kra.category',
                'leadUnit:id,name,code',
                'supportUnits:id,name,code',
            ])->where('is_active', true)->get();
        });

        return response()->json(['data' => $kpis]);
    }

    /** POST /mpms/achievements */
    public function storeAchievement(Request $request)
    {
        $data = $request->validate([
            'kpi_id'            => 'required|exists:mpms_kpis,id',
            'year'              => 'required|integer',
            'achievement_value' => 'required|numeric|min:0|max:100',
        ]);

        $achievement = MpmsAchievement::updateOrCreate(
            ['kpi_id' => $data['kpi_id'], 'year' => $data['year']],
            [
                'achievement_value' => $data['achievement_value'],
                'submitted_by'      => auth()->id(),
                'submitted_at'      => now(),
                'status'            => 'submitted',
            ]
        );

        $this->aggregation->bustCache($data['year']);

        return response()->json(['data' => $achievement], 201);
    }

    /** PATCH /mpms/achievements/{id} */
    public function updateAchievement(Request $request, MpmsAchievement $achievement)
    {
        $data = $request->validate([
            'achievement_value' => 'required|numeric|min:0|max:100',
            'status'            => 'sometimes|in:draft,submitted,approved',
        ]);

        $achievement->update(array_merge($data, [
            'submitted_by' => auth()->id(),
            'submitted_at' => now(),
        ]));

        $this->aggregation->bustCache($achievement->year);

        return response()->json(['data' => $achievement]);
    }
}
