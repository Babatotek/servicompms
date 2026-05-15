<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['id', 'name', 'code', 'head_user_id', 'unit_weight', 'staff_count', 'is_active'];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $casts = ['is_active' => 'boolean', 'unit_weight' => 'integer', 'staff_count' => 'integer'];

    public function head() { return $this->belongsTo(User::class, 'head_user_id'); }
    public function users() { return $this->hasMany(User::class, 'department_id', 'id'); }
    public function appraisals() { return $this->hasMany(Appraisal::class, 'department_id', 'id'); }
    public function mpmsKpis() { return $this->hasMany(MpmsKpi::class, 'lead_unit_id', 'id'); }
    public function unitWeight() { return $this->hasOne(MpmsUnitWeight::class, 'department_id', 'id'); }
}
