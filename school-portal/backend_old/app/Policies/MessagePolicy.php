<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function update(User $user, Message $message): bool
    {
        return $message->sender_id === $user->id && !$message->isDeleted();
    }

    public function delete(User $user, Message $message): bool
    {
        if ($user->isAdmin()) return true;
        return $message->sender_id === $user->id;
    }
}
