<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\MessageStatus;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MessageRepository extends EloquentRepository implements MessageRepositoryInterface
{
    public function __construct(Message $model)
    {
        parent::__construct($model);
    }

    public function paginateForConversation(int $conversationId, int $perPage): LengthAwarePaginator
    {
        return Message::with(['sender', 'attachments', 'replyTo.sender'])
            ->where('conversation_id', $conversationId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function markReadByUser(int $conversationId, int $userId): void
    {
        $unreadMessageIds = Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->whereDoesntHave('readBy', fn($q) => $q->where('users.id', $userId))
            ->pluck('id');

        if ($unreadMessageIds->isEmpty()) return;

        $now = now();
        $inserts = $unreadMessageIds->map(fn($id) => [
            'message_id' => $id,
            'user_id'    => $userId,
            'read_at'    => $now,
        ])->toArray();

        DB::table('message_reads')->insertOrIgnore($inserts);

        // Update participant last_read_at
        DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['last_read_at' => $now]);
    }

    public function getUnreadCount(int $userId): int
    {
        return Message::whereHas('conversation', function ($q) use ($userId) {
                $q->whereHas('participants', fn($q) => $q->where('users.id', $userId));
            })
            ->where('sender_id', '!=', $userId)
            ->whereDoesntHave('readBy', fn($q) => $q->where('users.id', $userId))
            ->count();
    }
}
