<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Competency extends Model
{
    protected $fillable = ['cluster', 'cluster_id', 'name', 'default_target', 'sort_order', 'is_active'];
    protected $casts    = ['is_active' => 'boolean', 'default_target' => 'integer'];

    public function cluster() { return $this->belongsTo(CompetencyCluster::class, 'cluster_id'); }
}
