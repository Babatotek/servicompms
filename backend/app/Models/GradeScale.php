<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GradeScale extends Model
{
    protected $fillable = ['key', 'label', 'threshold_percent', 'colour_hex', 'sort_order', 'is_active'];
    protected $casts    = ['threshold_percent' => 'float', 'is_active' => 'boolean'];

    public function scopeActive($q) { return $q->where('is_active', true)->orderBy('sort_order'); }
}
