<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSchedule extends Model
{
    protected $fillable = [
        'title', 'pretest_start', 'pretest_end',
        'learning_start', 'learning_end',
        'exam_start', 'exam_end',
        'kompetensi_ids', 'pretest_jumlah_per_kompetensi', 'pretest_durasi', 'is_active', 'status',
    ];

    protected function casts(): array
    {
        return [
            'pretest_start' => 'datetime',
            'pretest_end' => 'datetime',
            'learning_start' => 'datetime',
            'learning_end' => 'datetime',
            'exam_start' => 'datetime',
            'exam_end' => 'datetime',
            'kompetensi_ids' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function getCurrentPhaseAttribute(): string
    {
        $now = now();
        if ($now->between($this->exam_start, $this->exam_end)) return 'exam';
        if ($now->between($this->pretest_start, $this->pretest_end)) return 'pretest';
        if ($now->lt($this->pretest_start)) return 'upcoming';
        if ($this->exam_end && $now->gt($this->exam_end)) return 'closed';
        return 'learning';
    }
}
