<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractKra extends Model
{
    protected $fillable = ['contract_id', 'serial_no', 'name', 'weight'];
    protected $casts = ['weight' => 'float'];

    public function contract()    { return $this->belongsTo(PerformanceContract::class, 'contract_id'); }
    public function objectives()  { return $this->hasMany(ContractObjective::class, 'kra_id')->orderBy('id'); }
}
