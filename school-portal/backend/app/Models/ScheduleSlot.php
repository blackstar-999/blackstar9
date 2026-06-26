<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleSlot extends Model
{
    protected $fillable = [
        'schedule_id', 'day_of_week', 'period_number', 'start_time', 'end_time',
        'subject', 'teacher_name', 'room', 'is_override', 'override_date',
    ];

    protected function casts(): array
    {
        return [
            'is_override'   => 'boolean',
            'override_date' => 'date',
            'day_of_week'   => 'integer',
            'period_number' => 'integer',
        ];
    }

    public function getDayNameAttribute(): string
    {
        return match($this->day_of_week) {
            1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday',
            4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday',
            default => 'Unknown',
        };
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
