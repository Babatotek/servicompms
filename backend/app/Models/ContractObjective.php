<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractObjective extends Model
{
    protected $fillable = ['kra_id', 'description', 'weight', 'graded_weight'];
    protected $casts = ['weight' => 'float', 'graded_weight' => 'float'];

    public function kra()  { return $this->belongsTo(ContractKra::class, 'kra_id'); }
    public function kpis() { return $this->hasMany(ContractKpi::class, 'objective_id')->orderBy('id'); }
}
