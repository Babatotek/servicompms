<?php

namespace App\Policies;

use App\Models\PerformanceContract;
use App\Models\User;

class ContractPolicy
{
    public function update(User $user, PerformanceContract $contract): bool
    {
        return $contract->user_id === $user->id
            && in_array($contract->status, ['draft', 'returned']);
    }
}
