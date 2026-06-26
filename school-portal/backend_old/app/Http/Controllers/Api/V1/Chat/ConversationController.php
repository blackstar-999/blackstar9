<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Chat;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(private readonly ChatService $chatService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', fn($q) => $q->where('users.id', $user->id)
                ->where('is_archived', false))
            ->with(['participants', 'lastMessage'])
            ->orderByDesc('last_activity_at')
            ->paginate(20);

        $data = $conversations->getCollection()->map(
            fn($c) => new ConversationResource($c, $user->id)
        );

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page'    => $conversations->lastPage(),
                'total'        => $conversations->total(),
            ],
        ]);
    }

    public function archived(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', fn($q) => $q->where('users.id', $user->id)
                ->where('is_archived', true))
            ->with(['participants', 'lastMessage'])
            ->orderByDesc('last_activity_at')
            ->paginate(20);

        $data = $conversations->getCollection()->map(
            fn($c) => new ConversationResource($c, $user->id)
        );

        return response()->json(['data' => $data]);
    }

    public function startDirect(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer', 'exists:users,id', 'different:' . $request->user()->id]]);

        $conversation = $this->chatService->getOrCreateDirectConversation(
            $request->user()->id,
            $request->integer('user_id'),
        );

        $conversation->load(['participants', 'lastMessage']);

        return response()->json([
            'conversation' => new ConversationResource($conversation, $request->user()->id),
        ], 201);
    }

    public function createGroup(Request $request): JsonResponse
    {
        $request->validate([
            'name'            => ['required', 'string', 'max:100'],
            'participant_ids' => ['required', 'array', 'min:1'],
            'participant_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $conversation = $this->chatService->createGroupConversation(
            $request->user()->id,
            $request->string('name'),
            $request->input('participant_ids'),
        );

        $conversation->load(['participants', 'lastMessage']);

        return response()->json([
            'conversation' => new ConversationResource($conversation, $request->user()->id),
        ], 201);
    }

    public function archive(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->archiveConversation($conversationId, $request->user()->id);
        return response()->json(['message' => 'Conversation archived.']);
    }

    public function unarchive(Request $request, int $conversationId): JsonResponse
    {
        $this->chatService->unarchiveConversation($conversationId, $request->user()->id);
        return response()->json(['message' => 'Conversation unarchived.']);
    }
}
