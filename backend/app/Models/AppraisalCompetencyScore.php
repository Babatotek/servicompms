<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalCompetencyScore extends Model
{
    protected $fillable = ['appraisal_id', 'competency_id', 'score'];
    protected $casts    = ['score' => 'integer'];

    public function appraisal()  { return $this->belongsTo(Appraisal::class); }
    public function competency() { return $this->belongsTo(Competency::class); }
}
