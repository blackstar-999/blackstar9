<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MessageStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id', 'sender_id', 'reply_to_id', 'body',
        'status', 'edited_at', 'body_before_edit',
    ];

    protected function casts(): array
    {
        return [
            'status'    => MessageStatus::class,
            'edited_at' => 'datetime',
        ];
    }

    public function scopeVisible($query)
    {
        return $query->where('status', '!=', MessageStatus::Deleted);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function readBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_reads')
                    ->withPivot('read_at');
    }

    public function isReadByUser(int $userId): bool
    {
        return $this->readBy()->where('users.id', $userId)->exists();
    }

    public function isDeleted(): bool
    {
        return $this->status === MessageStatus::Deleted;
    }
}
