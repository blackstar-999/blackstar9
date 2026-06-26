<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\GalleryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GalleryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uploaded_by', 'image_path', 'thumbnail_path', 'caption',
        'album_name', 'status', 'rejection_reason', 'moderated_by',
        'moderated_at', 'likes_count', 'file_size',
    ];

    protected function casts(): array
    {
        return [
            'status'       => GalleryStatus::class,
            'moderated_at' => 'datetime',
            'likes_count'  => 'integer',
            'file_size'    => 'integer',
        ];
    }

    public function scopeApproved($query)
    {
        return $query->where('status', GalleryStatus::Approved);
    }

    public function scopeOrderByPopularity($query)
    {
        return $query->orderByDesc('likes_count')->orderByDesc('created_at');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'gallery_likes')
                    ->withPivot('created_at');
    }

    public function isLikedByUser(int $userId): bool
    {
        return $this->likedByUsers()->where('users.id', $userId)->exists();
    }
}
