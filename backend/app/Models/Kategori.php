<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['nama', 'slug', 'deskripsi', 'is_active'])]
#[Casts(['is_active' => 'boolean'])]
class Kategori extends Model
{
    use HasFactory, SoftDeletes;

    public function materis(): HasMany
    {
        return $this->hasMany(Materi::class);
    }
}
