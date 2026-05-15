<?php

namespace App\Policies;

use App\Models\Appraisal;
use App\Models\User;

class AppraisalPolicy
{
    /** Supervisor can review appraisals assigned to them */
    public function review(User $user, Appraisal $appraisal): bool
    {
        return $appraisal->supervisor_id === $user->id
            && in_array($appraisal->status, ['submitted', 'under_review']);
    }

    /** Counter-signer can act on appraisals assigned to them */
    public function counterSign(User $user, Appraisal $appraisal): bool
    {
        return $appraisal->counter_signer_id === $user->id
            && $appraisal->status === 'pending_counter_sign';
    }
}
