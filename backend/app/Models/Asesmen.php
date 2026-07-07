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

#[Fillable(['judul', 'deskripsi', 'kompetensi_id', 'level_id', 'jumlah_soal', 'durasi', 'nilai_lulus', 'acak_soal', 'acak_jawaban', 'tanggal_mulai', 'tanggal_selesai', 'status', 'created_by'])]
#[Casts(['jumlah_soal' => 'integer', 'durasi' => 'integer', 'nilai_lulus' => 'decimal:2', 'acak_soal' => 'boolean', 'acak_jawaban' => 'boolean', 'tanggal_mulai' => 'datetime', 'tanggal_selesai' => 'datetime'])]
class Asesmen extends Model
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

    public function bankSoals(): BelongsToMany
    {
        return $this->belongsToMany(BankSoal::class, 'asesmen_soals')->withPivot('urutan')->withTimestamps();
    }

    public function pesertaAsesmens(): HasMany
    {
        return $this->hasMany(PesertaAsesmen::class);
    }

    public function sertifikats(): HasMany
    {
        return $this->hasMany(Sertifikat::class);
    }
}
