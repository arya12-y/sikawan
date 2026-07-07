<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Casts;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['kompetensi_id', 'level_id', 'kategori_id', 'judul', 'deskripsi', 'jenis', 'file_path', 'thumbnail', 'url_video', 'durasi', 'urutan', 'is_published', 'published_at', 'created_by'])]
#[Casts(['durasi' => 'integer', 'urutan' => 'integer', 'is_published' => 'boolean', 'published_at' => 'datetime'])]
class Materi extends Model
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
}
