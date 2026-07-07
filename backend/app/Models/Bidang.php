<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['opd_id', 'nama', 'deskripsi', 'is_active'])]
#[Casts(['is_active' => 'boolean'])]
class Bidang extends Model
{
    use HasFactory, SoftDeletes;

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function walidatas(): HasMany
    {
        return $this->hasMany(Walidata::class);
    }
}
