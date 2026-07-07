<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['nama', 'icon', 'deskripsi', 'nilai_min', 'is_active'])]
#[Casts(['nilai_min' => 'decimal:2', 'is_active' => 'boolean'])]
class Badge extends Model
{
    use HasFactory, SoftDeletes;

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')->withPivot('earned_at')->withTimestamps();
    }
}
