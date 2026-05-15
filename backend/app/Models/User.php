<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'sanctum'; // Spatie uses this for role/permission lookups

    protected $fillable = [
        'firstname', 'surname', 'othername', 'email', 'password',
        'ippis_no', 'phone', 'designation', 'department_id',
        'supervisor_id', 'counter_signer_id', 'is_active', 'avatar_url',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['is_active' => 'boolean', 'email_verified_at' => 'datetime'];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function counterSigner()
    {
        return $this->belongsTo(User::class, 'counter_signer_id');
    }

    public function directReports()
    {
        return $this->hasMany(User::class, 'supervisor_id');
    }

    public function contracts()
    {
        return $this->hasMany(PerformanceContract::class);
    }

    public function appraisals()
    {
        return $this->hasMany(Appraisal::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getFullNameAttribute(): string
    {
        return trim("{$this->surname} {$this->firstname}");
    }
}
