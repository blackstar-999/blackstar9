<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function __construct($resource, private readonly int $currentUserId)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $pivot = $this->participants
            ->firstWhere('id', $this->currentUserId)
            ?->pivot;

        return [
            'id'               => $this->id,
            'type'             => $this->type->value,
            'name'             => $this->isDirect()
                ? $this->participants->firstWhere('id', '!=', $this->currentUserId)?->full_name
                : $this->name,
            'avatar'           => $this->isDirect()
                ? ($this->participants->firstWhere('id', '!=', $this->currentUserId)?->avatar_path
                    ? app(\App\Services\FileStorageService::class)->publicUrl(
                        $this->participants->firstWhere('id', '!=', $this->currentUserId)->avatar_path
                    )
                    : null)
                : null,
            'participants'     => $this->whenLoaded('participants', fn() =>
                $this->participants->map(fn($u) => [
                    'id'       => $u->id,
                    'full_name'=> $u->full_name,
                    'role'     => $u->pivot->role,
                ])
            ),
            'last_message'     => $this->whenLoaded('lastMessage', fn() =>
                $this->lastMessage ? [
                    'id'         => $this->lastMessage->id,
                    'body'       => $this->lastMessage->isDeleted() ? null : $this->lastMessage->body,
                    'sender_id'  => $this->lastMessage->sender_id,
                    'created_at' => $this->lastMessage->created_at->toISOString(),
                ] : null
            ),
            'unread_count'     => $this->getUnreadCountForUser($this->currentUserId),
            'is_archived'      => (bool) $pivot?->is_archived,
            'last_activity_at' => $this->last_activity_at?->toISOString(),
        ];
    }
}
