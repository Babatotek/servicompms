<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceContract extends Model
{
    protected $fillable = [
        'user_id', 'supervisor_id', 'year', 'template_id', 'status',
        'submitted_at', 'approved_by', 'approved_at',
        'supervisor_comment', 'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function user()       { return $this->belongsTo(User::class); }
    public function supervisor() { return $this->belongsTo(User::class, 'supervisor_id'); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by'); }
    public function template()   { return $this->belongsTo(KraTemplate::class, 'template_id'); }

    public function kras()
    {
        return $this->hasMany(ContractKra::class, 'contract_id');
    }

    // Full snapshot tree — used by appraisal form
    public function krasWithTree()
    {
        return $this->hasMany(ContractKra::class, 'contract_id')
            ->with(['objectives.kpis'])
            ->orderBy('serial_no');
    }
}
