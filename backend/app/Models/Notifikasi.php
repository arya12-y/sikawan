<?php

namespace App\Models;

use Database\Factories\NotifikasiFactory;
use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'judul', 'pesan', 'tipe', 'link', 'is_read', 'read_at'])]
#[Casts(['is_read' => 'boolean', 'read_at' => 'datetime'])]
class Notifikasi extends Model
{
    /** @use HasFactory<NotifikasiFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
