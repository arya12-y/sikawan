<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'materi_id', 'progress', 'is_completed', 'completed_at'])]
#[Casts(['progress' => 'integer', 'is_completed' => 'boolean', 'completed_at' => 'datetime'])]
class MateriProgress extends Model
{
    use HasFactory;

    protected $table = 'materi_progress';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class);
    }
}
