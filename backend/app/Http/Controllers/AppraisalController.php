<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppraisalResource;
use App\Models\Appraisal;
use App\Models\AppraisalComment;
use App\Models\AppraisalKpiScore;
use App\Models\AppraisalCompetencyScore;
use App\Models\AppraisalOperationsScore;
use App\Models\AppraisalPeriod;
use App\Services\ScoringService;
use App\Services\AppraisalWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AppraisalController extends Controller
{
    public function __construct(
        private ScoringService $scoring,
        private AppraisalWorkflowService $workflow
    ) {}

    /** GET /appraisals/my/{period}  e.g. Q2-2026 */
    public function mine(string $period)
    {
        $appraisal = Appraisal::with([
                'contract.krasWithTree',
                'kpiScores',
                'competencyScores',
                'operationsScores',
                'total',
                'comments',
                'period',
            ])
            ->where('user_id', auth()->id())
            ->whereHas('period', fn($q) => $q->where('label', $period))
            ->first();

        return $appraisal
            ? new AppraisalResource($appraisal)
            : response()->json(['data' => null]);
    }

    /** POST /appraisals  — create + save all scores in one transaction */
    public function store(Request $request)
    {
        $data = $request->validate([
            'contract_id'                    => 'required|exists:performance_contracts,id',
            'period_id'                      => 'required|exists:appraisal_periods,id',
            'year'                           => 'required|integer',
            'kpi_scores'                     => 'required|array',
            'kpi_scores.*.kpi_id'            => 'required|exists:contract_kpis,id',
            'kpi_scores.*.achievement'       => 'required|numeric|min:0',
            'competency_scores'              => 'required|array',
            'competency_scores.*.competency_id' => 'required|exists:competencies,id',
            'competency_scores.*.score'      => 'required|integer|min:0|max:5',
            'operations_scores'              => 'required|array',
            'operations_scores.*.item_id'    => 'required|exists:operations_items,id',
            'operations_scores.*.score'      => 'required|integer|min:0',
            'comments'                       => 'nullable|array',
            'comments.appraisee_comments'    => 'nullable|string|max:2000',
            'appraisee_signed'               => 'required|boolean',
        ]);

        if (! $data['appraisee_signed']) {
            return response()->json(['message' => 'Signature required before submitting.'], 422);
        }

        $appraisal = DB::transaction(function () use ($data) {
            // Upsert appraisal row
            $appraisal = Appraisal::updateOrCreate(
                [
                    'user_id'     => auth()->id(),
                    'contract_id' => $data['contract_id'],
                    'period_id'   => $data['period_id'],
                ],
                [
                    'year'              => $data['year'],
                    'status'            => 'submitted',
                    'submitted_at'      => now(),
                    'supervisor_id'     => auth()->user()->supervisor_id,
                    'counter_signer_id' => auth()->user()->counter_signer_id,
                    'appraisee_signed_at' => now(),
                ]
            );

            // KPI scores — upsert per kpi_id
            foreach ($data['kpi_scores'] as $row) {
                $kpi    = \App\Models\ContractKpi::find($row['kpi_id']);
                $scored = $this->scoring->scoreKpi(
                    $row['achievement'],
                    $kpi->criteria,
                    $kpi->direction
                );
                $weightedRaw = (($kpi->graded_weight ?? 0) * $scored['raw_score']) / 100;

                AppraisalKpiScore::updateOrCreate(
                    ['appraisal_id' => $appraisal->id, 'kpi_id' => $row['kpi_id']],
                    [
                        'achievement'       => $row['achievement'],
                        'raw_score'         => $scored['raw_score'],
                        'weighted_raw_score'=> $weightedRaw,
                        'grade_key'         => $scored['grade_key'],
                    ]
                );
            }

            // Competency scores
            foreach ($data['competency_scores'] as $row) {
                AppraisalCompetencyScore::updateOrCreate(
                    ['appraisal_id' => $appraisal->id, 'competency_id' => $row['competency_id']],
                    ['score' => $row['score']]
                );
            }

            // Operations scores
            foreach ($data['operations_scores'] as $row) {
                AppraisalOperationsScore::updateOrCreate(
                    ['appraisal_id' => $appraisal->id, 'item_id' => $row['item_id']],
                    ['score' => $row['score']]
                );
            }

            // Appraisee comment
            if (! empty($data['comments']['appraisee_comments'])) {
                AppraisalComment::updateOrCreate(
                    ['appraisal_id' => $appraisal->id, 'role' => 'appraisee'],
                    [
                        'comment'        => $data['comments']['appraisee_comments'],
                        'signature_date' => now(),
                    ]
                );
            }

            // Calculate and persist totals
            $this->scoring->calculate($appraisal);

            return $appraisal;
        });

        Cache::forget("dashboard:staff:{$appraisal->user_id}");
        Cache::forget("dashboard:supervisor:{$appraisal->supervisor_id}");

        return new AppraisalResource($appraisal->load(['total', 'period']));
    }

    /** GET /appraisals/supervisor-queue */
    public function supervisorQueue()
    {
        $appraisals = Appraisal::with([
                'user:id,surname,firstname,ippis_no,designation,department_id',
                'user.department:id,name,code',
                'total',
                'period:id,label,year',
            ])
            ->forSupervisor(auth()->id())
            ->pendingReview()
            ->orderByDesc('submitted_at')
            ->get();

        return AppraisalResource::collection($appraisals);
    }

    /** GET /appraisals/counter-queue */
    public function counterQueue()
    {
        $appraisals = Appraisal::with([
                'user:id,surname,firstname,ippis_no,designation,department_id',
                'user.department:id,name,code',
                'total',
                'period:id,label,year',
                'comments',
            ])
            ->forCounterSigner(auth()->id())
            ->orderByDesc('submitted_at')
            ->get();

        return AppraisalResource::collection($appraisals);
    }

    /** PATCH /appraisals/{id}/review  — supervisor approve or return */
    public function review(Request $request, Appraisal $appraisal)
    {
        $this->authorize('review', $appraisal);

        $data = $request->validate([
            'action'  => 'required|in:approve,return',
            'comment' => 'required|string|max:2000',
            'rating'  => 'nullable|integer|min:1|max:5',
        ]);

        $appraisal = $data['action'] === 'approve'
            ? $this->workflow->supervisorApprove($appraisal, $data['comment'], $data['rating'] ?? null)
            : $this->workflow->supervisorReturn($appraisal, $data['comment']);

        // Persist supervisor comment to appraisal_comments table too
        AppraisalComment::updateOrCreate(
            ['appraisal_id' => $appraisal->id, 'role' => 'supervisor'],
            ['comment' => $data['comment'], 'rating' => $data['rating'] ?? null, 'signature_date' => now()]
        );

        return new AppraisalResource($appraisal->load('total'));
    }

    /** PATCH /appraisals/{id}/counter-sign */
    public function counterSign(Request $request, Appraisal $appraisal)
    {
        $this->authorize('counterSign', $appraisal);

        $data = $request->validate(['comment' => 'required|string|max:2000']);

        $appraisal = $this->workflow->counterSign($appraisal, $data['comment']);

        AppraisalComment::updateOrCreate(
            ['appraisal_id' => $appraisal->id, 'role' => 'counter_signer'],
            ['comment' => $data['comment'], 'signature_date' => now()]
        );

        return new AppraisalResource($appraisal->load('total'));
    }

    /** PATCH /appraisals/{id}/return-from-counter */
    public function returnFromCounter(Request $request, Appraisal $appraisal)
    {
        $this->authorize('counterSign', $appraisal);

        $data = $request->validate(['comment' => 'required|string|max:2000']);

        $appraisal = $this->workflow->returnFromCounter($appraisal, $data['comment']);

        return new AppraisalResource($appraisal);
    }
}
