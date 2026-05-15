<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractKpi extends Model
{
    protected $fillable = [
        'objective_id', 'description', 'target_value', 'unit_of_measurement',
        'direction', 'criteria_O', 'criteria_E', 'criteria_VG',
        'criteria_G', 'criteria_F', 'criteria_P',
        'weight', 'graded_weight', 'mpms_kpi_id',
    ];

    protected $casts = [
        'target_value'  => 'float',
        'criteria_O'    => 'float',
        'criteria_E'    => 'float',
        'criteria_VG'   => 'float',
        'criteria_G'    => 'float',
        'criteria_F'    => 'float',
        'criteria_P'    => 'float',
        'weight'        => 'float',
        'graded_weight' => 'float',
    ];

    public function objective() { return $this->belongsTo(ContractObjective::class, 'objective_id'); }
    public function mpmsKpi()   { return $this->belongsTo(MpmsKpi::class, 'mpms_kpi_id'); }
    public function scores()    { return $this->hasMany(AppraisalKpiScore::class, 'kpi_id'); }

    public function getCriteriaAttribute(): array
    {
        return [
            'O'  => $this->criteria_O,
            'E'  => $this->criteria_E,
            'VG' => $this->criteria_VG,
            'G'  => $this->criteria_G,
            'F'  => $this->criteria_F,
            'P'  => $this->criteria_P,
        ];
    }
}
