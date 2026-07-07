<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['kode', 'nama', 'singkatan', 'alamat', 'telepon', 'email', 'website', 'logo', 'is_active'])]
#[Casts(['is_active' => 'boolean'])]
class Opd extends Model
{
    use HasFactory, SoftDeletes;

    public function bidangs(): HasMany
    {
        return $this->hasMany(Bidang::class);
    }

    public function walidatas(): HasMany
    {
        return $this->hasMany(Walidata::class);
    }
}
