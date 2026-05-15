<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appraisal extends Model
{
    protected $fillable = [
        'user_id', 'contract_id', 'period_id', 'year', 'status',
        'submitted_at', 'supervisor_id', 'counter_signer_id',
        'supervisor_comment', 'supervisor_rating', 'supervisor_reviewed_at',
        'counter_signer_comment', 'counter_signed_at',
        'appraisee_signed_at', 'appraisee_signature',
        'supervisor_signed_at', 'supervisor_signature',
        'counter_signer_signed_at', 'counter_signer_signature',
    ];

    protected $casts = [
        'submitted_at'             => 'datetime',
        'supervisor_reviewed_at'   => 'datetime',
        'counter_signed_at'        => 'datetime',
        'appraisee_signed_at'      => 'datetime',
        'supervisor_signed_at'     => 'datetime',
        'counter_signer_signed_at' => 'datetime',
        'supervisor_rating'        => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user()          { return $this->belongsTo(User::class); }
    public function contract()      { return $this->belongsTo(PerformanceContract::class, 'contract_id'); }
    public function period()        { return $this->belongsTo(AppraisalPeriod::class, 'period_id'); }
    public function supervisor()    { return $this->belongsTo(User::class, 'supervisor_id'); }
    public function counterSigner() { return $this->belongsTo(User::class, 'counter_signer_id'); }

    public function total()              { return $this->hasOne(AppraisalTotal::class); }
    public function kpiScores()          { return $this->hasMany(AppraisalKpiScore::class); }
    public function competencyScores()   { return $this->hasMany(AppraisalCompetencyScore::class); }
    public function operationsScores()   { return $this->hasMany(AppraisalOperationsScore::class); }
    public function comments()           { return $this->hasMany(AppraisalComment::class); }
    public function workflowLog()        { return $this->hasMany(AppraisalWorkflowLog::class)->orderBy('created_at'); }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForSupervisor($q, int $supervisorId)
    {
        return $q->where('supervisor_id', $supervisorId);
    }

    public function scopePendingReview($q)
    {
        return $q->whereIn('status', ['submitted', 'under_review']);
    }

    public function scopeForCounterSigner($q, int $userId)
    {
        return $q->where('counter_signer_id', $userId)
                 ->where('status', 'pending_counter_sign');
    }

    public function scopeApproved($q)
    {
        return $q->whereIn('status', ['approved', 'counter_signed']);
    }
}
