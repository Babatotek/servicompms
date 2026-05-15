<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpmsKra extends Model
{
    protected $fillable = ['category_id', 'serial_no', 'name', 'weight', 'year', 'is_active'];
    protected $casts    = ['weight' => 'float', 'is_active' => 'boolean'];

    public function category()   { return $this->belongsTo(MpmsPriorityCategory::class, 'category_id'); }
    public function objectives() { return $this->hasMany(MpmsObjective::class, 'kra_id'); }
}
