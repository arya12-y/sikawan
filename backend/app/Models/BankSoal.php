<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['kompetensi_id', 'level_id', 'jenis', 'pertanyaan', 'pilihan', 'jawaban_benar', 'pembahasan', 'bobot', 'is_active', 'created_by'])]
#[Casts(['pilihan' => 'array', 'bobot' => 'decimal:2', 'is_active' => 'boolean'])]
class BankSoal extends Model
{
    use HasFactory, SoftDeletes;

    public function kompetensi(): BelongsTo
    {
        return $this->belongsTo(Kompetensi::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function asesmens(): BelongsToMany
    {
        return $this->belongsToMany(Asesmen::class, 'asesmen_soals');
    }

    public function jawabanPesertas(): HasMany
    {
        return $this->hasMany(JawabanPeserta::class);
    }
}
