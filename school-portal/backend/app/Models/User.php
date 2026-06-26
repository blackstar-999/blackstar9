<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'password',
        'role', 'phone', 'class_name', 'avatar_path', 'bio',
        'telegram_id', 'telegram_username', 'telegram_verified_at',
        'is_active', 'is_banned', 'ban_reason', 'banned_at', 'last_seen_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'telegram_verified_at' => 'datetime',
            'banned_at'            => 'datetime',
            'last_seen_at'         => 'datetime',
            'role'                 => Role::class,
            'is_active'            => 'boolean',
            'is_banned'            => 'boolean',
        ];
    }

    // ── Computed ──────────────────────────────────────────────────

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function isTelegramVerified(): bool
    {
        return $this->telegram_verified_at !== null;
    }

    public function isPortalAccessible(): bool
    {
        return $this->is_active && !$this->is_banned && $this->isTelegramVerified();
    }

    public function hasRole(Role $role): bool
    {
        return $this->role === $role;
    }

    public function hasAtLeastRole(Role $role): bool
    {
        return $this->role->isAtLeast($role);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === Role::SuperAdmin;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [Role::Admin, Role::SuperAdmin]);
    }

    public function canManageSchedule(): bool
    {
        return $this->role->canManageSchedule();
    }

    // ── Relations ─────────────────────────────────────────────────

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'uploaded_by');
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(GalleryItem::class, 'uploaded_by');
    }

    public function likedCertificates(): BelongsToMany
    {
        return $this->belongsToMany(Certificate::class, 'certificate_likes')
                    ->withPivot('created_at')
                    ->withTimestamps();
    }

    public function likedGalleryItems(): BelongsToMany
    {
        return $this->belongsToMany(GalleryItem::class, 'gallery_likes')
                    ->withPivot('created_at')
                    ->withTimestamps();
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
                    ->withPivot(['role', 'is_archived', 'archived_at', 'last_read_at'])
                    ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function telegramVerifications(): HasMany
    {
        return $this->hasMany(TelegramVerification::class);
    }

    public function libraryFiles(): HasMany
    {
        return $this->hasMany(LibraryFile::class, 'uploaded_by');
    }
}
