<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KraTemplate extends Model
{
    protected $fillable = ['name', 'description', 'department_id', 'version', 'is_active', 'created_by'];
    protected $casts    = ['is_active' => 'boolean'];

    public function department() { return $this->belongsTo(Department::class, 'department_id', 'id'); }
    public function creator()    { return $this->belongsTo(User::class, 'created_by'); }
    public function kras()       { return $this->hasMany(KraTemplateItem::class, 'template_id')->orderBy('serial_no'); }
}
