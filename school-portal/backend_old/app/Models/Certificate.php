<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CertificateLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Certificate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uploaded_by', 'first_name', 'last_name', 'class_name',
        'subject', 'level', 'image_path', 'description', 'year',
        'likes_count', 'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'level'      => CertificateLevel::class,
            'is_visible' => 'boolean',
            'likes_count'=> 'integer',
            'year'       => 'integer',
        ];
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'certificate_likes')
                    ->withPivot('created_at');
    }

    public function isLikedByUser(int $userId): bool
    {
        return $this->likedByUsers()->where('users.id', $userId)->exists();
    }
}
