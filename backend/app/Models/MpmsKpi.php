<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpmsKpi extends Model
{
    protected $fillable = [
        'objective_id', 'description', 'annual_target',
        'unit_of_measurement', 'lead_unit_id', 'year', 'is_active',
    ];

    protected $casts = ['annual_target' => 'float', 'is_active' => 'boolean'];

    public function objective()    { return $this->belongsTo(MpmsObjective::class, 'objective_id'); }
    public function leadUnit()     { return $this->belongsTo(Department::class, 'lead_unit_id', 'id'); }
    public function supportUnits() { return $this->belongsToMany(Department::class, 'mpms_kpi_support_units', 'kpi_id', 'department_id'); }
    public function achievements() { return $this->hasMany(MpmsAchievement::class, 'kpi_id'); }
}
