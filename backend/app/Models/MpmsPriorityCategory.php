<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpmsPriorityCategory extends Model
{
    protected $fillable = ['code', 'name', 'weight_percent', 'sort_order'];
    protected $casts    = ['weight_percent' => 'integer'];

    public function kras() { return $this->hasMany(MpmsKra::class, 'category_id')->orderBy('serial_no'); }
}
