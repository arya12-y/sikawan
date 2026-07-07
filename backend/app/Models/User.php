<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'nip', 'phone', 'address', 'photo', 'password', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
#[Casts(['email_verified_at' => 'datetime', 'password' => 'hashed', 'is_active' => 'boolean'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    public function walidata(): HasOne
    {
        return $this->hasOne(Walidata::class);
    }

    public function penguji(): HasOne
    {
        return $this->hasOne(Penguji::class);
    }

    public function materiProgress(): HasMany
    {
        return $this->hasMany(MateriProgress::class);
    }

    public function pesertaAsesmens(): HasMany
    {
        return $this->hasMany(PesertaAsesmen::class);
    }

    public function sertifikats(): HasMany
    {
        return $this->hasMany(Sertifikat::class);
    }

    public function notifikasis(): HasMany
    {
        return $this->hasMany(Notifikasi::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')->withPivot('earned_at')->withTimestamps();
    }
}
