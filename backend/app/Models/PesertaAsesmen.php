<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['asesmen_id', 'user_id', 'waktu_mulai', 'waktu_selesai', 'nilai', 'status', 'lulus', 'approved_by', 'approved_at', 'catatan_approve'])]
class PesertaAsesmen extends Model
{
    use HasFactory;

    protected $casts = ['waktu_mulai' => 'datetime', 'waktu_selesai' => 'datetime', 'nilai' => 'decimal:2', 'lulus' => 'boolean', 'approved_at' => 'datetime'];

    public const STATUS_MENUNGGU_DINILAI = 'menunggu_dinilai';
    public const STATUS_WAWANCARA = 'wawancara';

    public function asesmen(): BelongsTo
    {
        return $this->belongsTo(Asesmen::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function jawabanPesertas(): HasMany
    {
        return $this->hasMany(JawabanPeserta::class);
    }
}
