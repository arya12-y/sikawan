<?php

namespace App\Models;

use Database\Factories\NilaiKompetensiFactory;
use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'kompetensi_id', 'asesmen_id', 'level_id', 'nilai', 'kategori'])]
#[Casts(['nilai' => 'decimal:2'])]
class NilaiKompetensi extends Model
{
    /** @use HasFactory<NilaiKompetensiFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kompetensi(): BelongsTo
    {
        return $this->belongsTo(Kompetensi::class);
    }

    public function asesmen(): BelongsTo
    {
        return $this->belongsTo(Asesmen::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }
}
