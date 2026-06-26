<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\MessageDTO;
use App\Enums\ConversationType;
use App\Enums\MessageStatus;
use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageSent;
use App\Exceptions\AuthException;
use App\Exceptions\BusinessException;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatService
{
    public function __construct(
        private readonly MessageRepositoryInterface $messageRepository,
        private readonly FileStorageService $storageService,
    ) {}

    public function getOrCreateDirectConversation(int $userAId, int $userBId): Conversation
    {
        // Find existing direct conversation between two users
        $existing = Conversation::where('type', ConversationType::Direct)
            ->whereHas('participants', fn($q) => $q->where('users.id', $userAId))
            ->whereHas('participants', fn($q) => $q->where('users.id', $userBId))
            ->first();

        if ($existing) return $existing;

        return DB::transaction(function () use ($userAId, $userBId) {
            $conversation = Conversation::create([
                'type'       => ConversationType::Direct,
                'created_by' => $userAId,
            ]);

            $conversation->participants()->attach([$userAId, $userBId], ['role' => 'member']);

            return $conversation;
        });
    }

    public function createGroupConversation(int $creatorId, string $name, array $participantIds): Conversation
    {
        return DB::transaction(function () use ($creatorId, $name, $participantIds) {
            $conversation = Conversation::create([
                'type'       => ConversationType::Group,
                'name'       => $name,
                'created_by' => $creatorId,
            ]);

            $participants = collect(array_unique(array_merge([$creatorId], $participantIds)))
                ->mapWithKeys(fn($id) => [$id => ['role' => $id === $creatorId ? 'admin' : 'member']]);

            $conversation->participants()->attach($participants);

            return $conversation;
        });
    }

    public function sendMessage(MessageDTO $dto, array $attachmentFiles = []): Message
    {
        $this->assertParticipant($dto->conversationId, $dto->senderId);

        return DB::transaction(function () use ($dto, $attachmentFiles) {
            $message = Message::create([
                'conversation_id' => $dto->conversationId,
                'sender_id'       => $dto->senderId,
                'reply_to_id'     => $dto->replyToId,
                'body'            => $dto->body,
                'status'          => MessageStatus::Sent,
            ]);

            foreach ($attachmentFiles as $file) {
                $this->storeAttachment($message, $file);
            }

            // Update conversation last activity
            Conversation::where('id', $dto->conversationId)->update([
                'last_message_id'  => $message->id,
                'last_activity_at' => now(),
            ]);

            $message->load(['sender', 'attachments', 'replyTo.sender']);

            broadcast(new MessageSent($message))->toOthers();

            return $message;
        });
    }

    public function editMessage(int $messageId, int $userId, string $newBody): Message
    {
        $message = Message::findOrFail($messageId);

        if ($message->sender_id !== $userId) {
            throw new AuthException('You cannot edit this message.');
        }

        if ($message->isDeleted()) {
            throw new BusinessException('Cannot edit a deleted message.');
        }

        $oldBody = $message->body;

        $message->update([
            'body'            => $newBody,
            'status'          => MessageStatus::Edited,
            'edited_at'       => now(),
            'body_before_edit'=> $oldBody,
        ]);

        broadcast(new MessageEdited($message))->toOthers();

        return $message;
    }

    public function deleteMessage(int $messageId, int $userId): Message
    {
        $message = Message::findOrFail($messageId);

        if ($message->sender_id !== $userId) {
            throw new AuthException('You cannot delete this message.');
        }

        $message->update([
            'body'   => null,
            'status' => MessageStatus::Deleted,
        ]);

        broadcast(new MessageDeleted($message))->toOthers();

        return $message;
    }

    public function markConversationRead(int $conversationId, int $userId): void
    {
        $this->assertParticipant($conversationId, $userId);
        $this->messageRepository->markReadByUser($conversationId, $userId);
    }

    public function archiveConversation(int $conversationId, int $userId): void
    {
        $this->assertParticipant($conversationId, $userId);

        DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['is_archived' => true, 'archived_at' => now()]);
    }

    public function unarchiveConversation(int $conversationId, int $userId): void
    {
        $this->assertParticipant($conversationId, $userId);

        DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->update(['is_archived' => false, 'archived_at' => null]);
    }

    private function storeAttachment(Message $message, UploadedFile $file): MessageAttachment
    {
        $maxSize = (int) config('storage.chat_max', 15 * 1024 * 1024);
        if ($file->getSize() > $maxSize) {
            throw new BusinessException('File exceeds the 15MB chat attachment limit.');
        }

        $path = $this->storageService->storePrivate($file, 'chat-attachments');

        $type = match(true) {
            str_starts_with($file->getMimeType(), 'image/') => 'image',
            str_starts_with($file->getMimeType(), 'video/') => 'video',
            default => 'file',
        };

        return $message->attachments()->create([
            'file_path'         => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type'         => $file->getMimeType(),
            'file_size'         => $file->getSize(),
            'type'              => $type,
        ]);
    }

    private function assertParticipant(int $conversationId, int $userId): void
    {
        $isParticipant = DB::table('conversation_participants')
            ->where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->exists();

        if (!$isParticipant) {
            throw new AuthException('You are not a participant in this conversation.');
        }
    }
}
