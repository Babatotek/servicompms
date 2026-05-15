<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalKpiScore extends Model
{
    protected $fillable = ['appraisal_id', 'kpi_id', 'achievement', 'raw_score', 'weighted_raw_score', 'grade_key'];
    protected $casts = ['achievement' => 'float', 'raw_score' => 'float', 'weighted_raw_score' => 'float'];

    public function appraisal() { return $this->belongsTo(Appraisal::class); }
    public function kpi()       { return $this->belongsTo(ContractKpi::class, 'kpi_id'); }
}
