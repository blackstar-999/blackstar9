<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Message;
use Illuminate\Pagination\LengthAwarePaginator;

interface MessageRepositoryInterface extends RepositoryInterface
{
    public function paginateForConversation(int $conversationId, int $perPage): LengthAwarePaginator;
    public function markReadByUser(int $conversationId, int $userId): void;
    public function getUnreadCount(int $userId): int;
}
