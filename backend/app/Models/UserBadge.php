<?php

namespace App\Models;

use Database\Factories\UserBadgeFactory;
use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'badge_id', 'earned_at'])]
#[Casts(['earned_at' => 'datetime'])]
class UserBadge extends Model
{
    /** @use HasFactory<UserBadgeFactory> */
    use HasFactory;

    protected $table = 'user_badges';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }
}
