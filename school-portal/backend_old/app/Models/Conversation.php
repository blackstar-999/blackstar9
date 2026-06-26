<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ConversationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'name', 'avatar_path', 'created_by', 'last_message_id', 'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'type'             => ConversationType::class,
            'last_activity_at' => 'datetime',
        ];
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withPivot(['role', 'is_archived', 'archived_at', 'last_read_at'])
                    ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isDirect(): bool
    {
        return $this->type === ConversationType::Direct;
    }

    public function getUnreadCountForUser(int $userId): int
    {
        $participant = $this->participants()->where('users.id', $userId)->first();
        if (!$participant) return 0;

        $lastReadAt = $participant->pivot->last_read_at;

        return $this->messages()
                    ->where('sender_id', '!=', $userId)
                    ->when($lastReadAt, fn($q) => $q->where('created_at', '>', $lastReadAt))
                    ->count();
    }
}
