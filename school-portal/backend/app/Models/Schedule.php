<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_name', 'academic_year', 'is_active', 'notes', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function slots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class)->orderBy('day_of_week')->orderBy('period_number');
    }

    public function regularSlots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class)->where('is_override', false)
                    ->orderBy('day_of_week')->orderBy('period_number');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
