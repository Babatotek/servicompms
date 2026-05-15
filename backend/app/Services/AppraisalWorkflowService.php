<?php

namespace App\Services;

use App\Models\Appraisal;
use App\Models\AppraisalWorkflowLog;
use Illuminate\Support\Facades\Cache;

class AppraisalWorkflowService
{
    public function __construct(private ScoringService $scoring) {}

    /**
     * Supervisor approves — routes to pending_counter_sign if counter-signer assigned,
     * otherwise straight to approved. Mirrors frontend updateAppraisalStatus logic.
     */
    public function supervisorApprove(Appraisal $appraisal, string $comment, ?int $rating): Appraisal
    {
        $fromStatus = $appraisal->status;

        $toStatus = $appraisal->counter_signer_id
            ? 'pending_counter_sign'
            : 'approved';

        $appraisal->update([
            'status'                  => $toStatus,
            'supervisor_comment'      => $comment,
            'supervisor_rating'       => $rating,
            'supervisor_reviewed_at'  => now(),
        ]);

        $this->log($appraisal, 'approve', $fromStatus, $toStatus, $comment);
        $this->bustAppraisalCaches($appraisal);

        return $appraisal;
    }

    public function supervisorReturn(Appraisal $appraisal, string $comment): Appraisal
    {
        $fromStatus = $appraisal->status;

        $appraisal->update([
            'status'                 => 'returned',
            'supervisor_comment'     => $comment,
            'supervisor_reviewed_at' => now(),
        ]);

        $this->log($appraisal, 'return', $fromStatus, 'returned', $comment);
        $this->bustAppraisalCaches($appraisal);

        return $appraisal;
    }

    public function counterSign(Appraisal $appraisal, string $comment): Appraisal
    {
        $fromStatus = $appraisal->status;

        $appraisal->update([
            'status'                  => 'counter_signed',
            'counter_signer_comment'  => $comment,
            'counter_signed_at'       => now(),
        ]);

        $this->log($appraisal, 'counter_sign', $fromStatus, 'counter_signed', $comment);
        $this->bustAppraisalCaches($appraisal);

        return $appraisal;
    }

    public function returnFromCounter(Appraisal $appraisal, string $comment): Appraisal
    {
        $fromStatus = $appraisal->status;

        $appraisal->update([
            'status'                 => 'returned',
            'counter_signer_comment' => $comment,
            'counter_signed_at'      => now(),
        ]);

        $this->log($appraisal, 'return_from_counter', $fromStatus, 'returned', $comment);
        $this->bustAppraisalCaches($appraisal);

        return $appraisal;
    }

    private function log(Appraisal $appraisal, string $action, string $from, string $to, ?string $comment): void
    {
        AppraisalWorkflowLog::create([
            'appraisal_id' => $appraisal->id,
            'action'       => $action,
            'actor_id'     => auth()->id(),
            'from_status'  => $from,
            'to_status'    => $to,
            'comment'      => $comment,
        ]);
    }

    private function bustAppraisalCaches(Appraisal $appraisal): void
    {
        Cache::forget("dashboard:staff:{$appraisal->user_id}");
        Cache::forget("dashboard:supervisor:{$appraisal->supervisor_id}");
        Cache::forget("leaderboard:annual:{$appraisal->year}");
        Cache::forget("leaderboard:dept:{$appraisal->year}");
        Cache::forget("leaderboard:quarter:{$appraisal->year}");
        Cache::forget("analytics:score_trend:{$appraisal->user_id}");
        Cache::forget("analytics:kra_breakdown:{$appraisal->user_id}");
        Cache::forget("dashboard:exec:org_wide:{$appraisal->year}");
    }
}
