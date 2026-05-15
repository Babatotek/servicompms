<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpmsObjective extends Model
{
    protected $fillable = ['kra_id', 'description', 'weight'];
    protected $casts    = ['weight' => 'float'];

    public function kra()  { return $this->belongsTo(MpmsKra::class, 'kra_id'); }
    public function kpis() { return $this->hasMany(MpmsKpi::class, 'objective_id'); }
}
