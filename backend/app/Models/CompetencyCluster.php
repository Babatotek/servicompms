<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetencyCluster extends Model
{
    protected $fillable = ['name', 'weight', 'sort_order', 'is_active'];
    protected $casts    = ['weight' => 'float', 'is_active' => 'boolean'];

    public function items() { return $this->hasMany(Competency::class, 'cluster_id')->orderBy('sort_order'); }
}
