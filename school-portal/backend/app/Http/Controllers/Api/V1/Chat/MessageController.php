<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Chat;

use App\DTOs\MessageDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\EditMessageRequest;
use App\Http\Requests\Chat\SendMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function __construct(
        private readonly ChatService $chatService,
        private readonly MessageRepositoryInterface $messageRepository,
    ) {}

    public function index(Request $request, int $conversationId): JsonResponse
    {
        $messages = $this->messageRepository->paginateForConversation($conversationId, 30);

        // Auto-mark as read
        $this->messageRepository->markReadByUser($conversationId, $request->user()->id);

        return response()->json([
            'data' => MessageResource::collection($messages->getCollection()->reverse()->values()),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
            ],
        ]);
    }

    public function store(SendMessageRequest $request): JsonResponse
    {
        $dto = MessageDTO::fromArray($request->validated(), $request->user()->id);

        $message = $this->chatService->sendMessage(
            $dto,
            $request->file('attachments', []),
        );

        return response()->json(['message' => new MessageResource($message)], 201);
    }

    public function update(EditMessageRequest $request, int $messageId): JsonResponse
    {
        $message = Message::findOrFail($messageId);
        Gate::authorize('update', $message);

        $message = $this->chatService->editMessage($messageId, $request->user()->id, $request->validated('body'));

        return response()->json(['message' => new MessageResource($message)]);
    }

    public function destroy(Request $request, int $messageId): JsonResponse
    {
        $message = Message::findOrFail($messageId);
        Gate::authorize('delete', $message);

        $this->chatService->deleteMessage($messageId, $request->user()->id);

        return response()->json(['message' => 'Message deleted.']);
    }

    public function markRead(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->markConversationRead($conversationId, $request->user()->id);
        return response()->json(['message' => 'Marked as read.']);
    }

    public function downloadAttachment(Request $request, int $attachmentId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $attachment = MessageAttachment::findOrFail($attachmentId);

        // Verify user is participant of the conversation
        $message = $attachment->message;
        $isParticipant = \Illuminate\Support\Facades\DB::table('conversation_participants')
            ->where('conversation_id', $message->conversation_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        abort_unless($isParticipant, 403);

        return Storage::disk('local')->download($attachment->file_path, $attachment->original_filename);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->messageRepository->getUnreadCount($request->user()->id);
        return response()->json(['unread_count' => $count]);
    }
}
