<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Message $message) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("conversation.{$this->message->conversation_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id'       => $this->message->sender_id,
            'sender'          => [
                'id'         => $this->message->sender->id,
                'full_name'  => $this->message->sender->full_name,
                'avatar_path'=> $this->message->sender->avatar_path,
            ],
            'body'            => $this->message->body,
            'status'          => $this->message->status->value,
            'reply_to_id'     => $this->message->reply_to_id,
            'attachments'     => $this->message->attachments->map(fn($a) => [
                'id'                => $a->id,
                'original_filename' => $a->original_filename,
                'mime_type'         => $a->mime_type,
                'file_size'         => $a->file_size,
                'type'              => $a->type,
            ]),
            'created_at'      => $this->message->created_at->toISOString(),
        ];
    }
}
