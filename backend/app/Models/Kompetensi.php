<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['kode', 'nama', 'deskripsi', 'domain', 'is_active'])]
#[Casts(['is_active' => 'boolean'])]
class Kompetensi extends Model
{
    use HasFactory, SoftDeletes;

    public function materis(): HasMany
    {
        return $this->hasMany(Materi::class);
    }

    public function bankSoals(): HasMany
    {
        return $this->hasMany(BankSoal::class);
    }

    public function asesmens(): HasMany
    {
        return $this->hasMany(Asesmen::class);
    }

    public function nilaiKompetensis(): HasMany
    {
        return $this->hasMany(NilaiKompetensi::class);
    }

    public function sertifikats(): HasMany
    {
        return $this->hasMany(Sertifikat::class);
    }
}
