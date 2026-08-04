<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['kompetensi_id', 'level_id', 'kategori_id', 'judul', 'deskripsi', 'jenis', 'file_path', 'thumbnail', 'url_video', 'durasi', 'urutan', 'is_published', 'published_at', 'created_by'])]
class Materi extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = ['durasi' => 'integer', 'urutan' => 'integer', 'is_published' => 'boolean', 'published_at' => 'datetime'];

    public function kompetensi(): BelongsTo
    {
        return $this->belongsTo(Kompetensi::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(MateriProgress::class);
    }

    public function soals(): BelongsToMany
    {
        return $this->belongsToMany(BankSoal::class, 'materi_soals');
    }
}
