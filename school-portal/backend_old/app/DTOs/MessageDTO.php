<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class MessageDTO
{
    public function __construct(
        public int    $conversationId,
        public int    $senderId,
        public string $body,
        public ?int   $replyToId = null,
    ) {}

    public static function fromArray(array $data, int $senderId): self
    {
        return new self(
            conversationId: (int) $data['conversation_id'],
            senderId:       $senderId,
            body:           $data['body'],
            replyToId:      isset($data['reply_to_id']) ? (int) $data['reply_to_id'] : null,
        );
    }
}
