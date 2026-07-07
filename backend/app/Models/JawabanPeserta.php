<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['peserta_asesmen_id', 'bank_soal_id', 'jawaban', 'is_benar', 'nilai', 'catatan_penguji', 'dinilai_oleh', 'dinilai_at'])]
#[Casts(['is_benar' => 'boolean', 'nilai' => 'decimal:2', 'dinilai_at' => 'datetime'])]
class JawabanPeserta extends Model
{
    use HasFactory;

    public function pesertaAsesmen(): BelongsTo
    {
        return $this->belongsTo(PesertaAsesmen::class);
    }

    public function bankSoal(): BelongsTo
    {
        return $this->belongsTo(BankSoal::class);
    }

    public function penilai(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dinilai_oleh');
    }
}
