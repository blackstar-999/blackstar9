<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PublishStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'author_id', 'title', 'slug', 'excerpt', 'body',
        'cover_image_path', 'status', 'published_at', 'view_count', 'tags',
    ];

    protected function casts(): array
    {
        return [
            'status'       => PublishStatus::class,
            'published_at' => 'datetime',
            'tags'         => 'array',
            'view_count'   => 'integer',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('status', PublishStatus::Published)
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }
}
