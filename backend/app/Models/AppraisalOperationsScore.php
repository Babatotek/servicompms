<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppraisalOperationsScore extends Model
{
    protected $fillable = ['appraisal_id', 'item_id', 'score'];
    protected $casts    = ['score' => 'integer'];

    public function appraisal()      { return $this->belongsTo(Appraisal::class); }
    public function operationsItem() { return $this->belongsTo(OperationsItem::class, 'item_id'); }
}
