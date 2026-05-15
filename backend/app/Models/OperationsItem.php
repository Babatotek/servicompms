<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationsItem extends Model
{
    protected $fillable = ['name', 'description', 'default_target', 'max_score', 'sort_order', 'is_active'];
    protected $casts    = ['is_active' => 'boolean', 'default_target' => 'integer', 'max_score' => 'integer'];
}
