<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalPeriod extends Model
{
    protected $fillable = [
        'year', 'label', 'quarter',
        'coverage_start', 'coverage_end',
        'submission_opens', 'submission_closes', 'is_active',
    ];

    protected $casts = [
        'coverage_start'    => 'date',
        'coverage_end'      => 'date',
        'submission_opens'  => 'datetime',
        'submission_closes' => 'datetime',
        'is_active'         => 'boolean',
    ];

    public function scopeActive($q) { return $q->where('is_active', true); }

    public function appraisals() { return $this->hasMany(Appraisal::class, 'period_id'); }
}
