<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpmsAchievement extends Model
{
    protected $fillable = [
        'kpi_id', 'year', 'achievement_value', 'lead_unit_score',
        'submitted_by', 'submitted_at', 'approved_by', 'approved_at', 'status',
    ];

    protected $casts = [
        'achievement_value' => 'float',
        'lead_unit_score'   => 'float',
        'submitted_at'      => 'datetime',
        'approved_at'       => 'datetime',
    ];

    public function kpi()         { return $this->belongsTo(MpmsKpi::class, 'kpi_id'); }
    public function submittedBy() { return $this->belongsTo(User::class, 'submitted_by'); }
    public function approvedBy()  { return $this->belongsTo(User::class, 'approved_by'); }
}
