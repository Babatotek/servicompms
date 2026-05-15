<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalComment extends Model
{
    protected $fillable = [
        'appraisal_id', 'role', 'comment',
        'strengths', 'improvement_areas', 'rating', 'signature_date',
    ];

    protected $casts = ['signature_date' => 'datetime', 'rating' => 'integer'];

    public function appraisal() { return $this->belongsTo(Appraisal::class); }
}
