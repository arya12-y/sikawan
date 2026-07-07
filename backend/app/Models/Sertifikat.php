<?php

namespace App\Models;

use Database\Factories\SertifikatFactory;
use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['nomor_sertifikat', 'user_id', 'asesmen_id', 'kompetensi_id', 'level_id', 'nilai_akhir', 'kategori_kompetensi', 'tanggal_terbit', 'tanggal_expired', 'file_path', 'qr_code', 'is_active'])]
#[Casts(['nilai_akhir' => 'decimal:2', 'tanggal_terbit' => 'date', 'tanggal_expired' => 'date', 'is_active' => 'boolean'])]
class Sertifikat extends Model
{
    /** @use HasFactory<SertifikatFactory> */
    use HasFactory, SoftDeletes;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function asesmen(): BelongsTo
    {
        return $this->belongsTo(Asesmen::class);
    }

    public function kompetensi(): BelongsTo
    {
        return $this->belongsTo(Kompetensi::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }
}
