<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;

// Private channel: conversation members only
Broadcast::channel('conversation.{conversationId}', function ($user, int $conversationId) {
    return \Illuminate\Support\Facades\DB::table('conversation_participants')
        ->where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});

// Private channel: per-user notifications
Broadcast::channel('user.{userId}', function ($user, int $userId) {
    return (int) $user->id === $userId;
});
