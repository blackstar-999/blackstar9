<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PublishStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'author_id', 'title', 'slug', 'description', 'location',
        'cover_image_path', 'starts_at', 'ends_at', 'status', 'is_public',
    ];

    protected function casts(): array
    {
        return [
            'status'    => PublishStatus::class,
            'starts_at' => 'datetime',
            'ends_at'   => 'datetime',
            'is_public' => 'boolean',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('status', PublishStatus::Published);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>=', now());
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
