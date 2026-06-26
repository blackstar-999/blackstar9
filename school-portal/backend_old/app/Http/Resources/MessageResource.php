<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $storageService = app(\App\Services\FileStorageService::class);

        return [
            'id'              => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id'       => $this->sender_id,
            'sender'          => $this->whenLoaded('sender', fn() => [
                'id'         => $this->sender->id,
                'full_name'  => $this->sender->full_name,
                'avatar_url' => $this->sender->avatar_path
                    ? $storageService->publicUrl($this->sender->avatar_path)
                    : null,
            ]),
            'reply_to'        => $this->whenLoaded('replyTo', fn() => $this->replyTo ? [
                'id'      => $this->replyTo->id,
                'body'    => $this->replyTo->isDeleted() ? null : $this->replyTo->body,
                'sender'  => $this->replyTo->sender ? [
                    'full_name' => $this->replyTo->sender->full_name,
                ] : null,
            ] : null),
            'body'            => $this->isDeleted() ? null : $this->body,
            'status'          => $this->status->value,
            'edited_at'       => $this->edited_at?->toISOString(),
            'attachments'     => $this->whenLoaded('attachments', fn() =>
                $this->attachments->map(fn($a) => [
                    'id'                => $a->id,
                    'original_filename' => $a->original_filename,
                    'mime_type'         => $a->mime_type,
                    'file_size'         => $a->file_size,
                    'type'              => $a->type,
                    'download_url'      => route('api.v1.chat.attachment.download', $a->id),
                ])
            ),
            'created_at'      => $this->created_at->toISOString(),
        ];
    }
}
