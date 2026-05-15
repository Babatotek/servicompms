<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalTotal extends Model
{
    protected $fillable = [
        'appraisal_id', 'section_4_score', 'section_5_score',
        'section_6_score', 'grand_total', 'final_grade',
    ];

    protected $casts = [
        'section_4_score' => 'float',
        'section_5_score' => 'float',
        'section_6_score' => 'float',
        'grand_total'     => 'float',
    ];

    public function appraisal() { return $this->belongsTo(Appraisal::class); }
}
