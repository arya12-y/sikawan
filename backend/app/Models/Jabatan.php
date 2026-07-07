<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['nama', 'deskripsi', 'level', 'is_active'])]
#[Casts(['level' => 'integer', 'is_active' => 'boolean'])]
class Jabatan extends Model
{
    use HasFactory, SoftDeletes;

    public function walidatas(): HasMany
    {
        return $this->hasMany(Walidata::class);
    }
}
