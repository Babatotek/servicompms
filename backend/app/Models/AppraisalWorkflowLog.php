<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalWorkflowLog extends Model
{
    protected $fillable = ['appraisal_id', 'action', 'actor_id', 'from_status', 'to_status', 'comment'];

    public function appraisal() { return $this->belongsTo(Appraisal::class); }
    public function actor()     { return $this->belongsTo(User::class, 'actor_id'); }
}
