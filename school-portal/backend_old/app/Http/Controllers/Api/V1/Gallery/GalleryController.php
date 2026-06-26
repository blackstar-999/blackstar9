<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Gallery;

use App\DTOs\GalleryItemDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Gallery\UploadGalleryRequest;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Services\GalleryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class GalleryController extends Controller
{
    public function __construct(private readonly GalleryService $galleryService) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->galleryService->paginateApproved($request->integer('per_page', 24));
        return response()->json([
            'data' => GalleryItemResource::collection($items),
            'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'total' => $items->total()],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $item = GalleryItem::approved()->findOrFail($id);
        return response()->json(['item' => new GalleryItemResource($item)]);
    }

    public function store(UploadGalleryRequest $request): JsonResponse
    {
        Gate::authorize('create', GalleryItem::class);

        $dto = GalleryItemDTO::fromArray($request->validated(), '', $request->user()->id);
        $item = $this->galleryService->upload($request->file('image'), $dto);

        return response()->json(['item' => new GalleryItemResource($item), 'message' => 'Image submitted for moderation.'], 201);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $result = $this->galleryService->toggleLike($id, $request->user()->id);
        return response()->json($result);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);
        Gate::authorize('delete', $item);
        $this->galleryService->reject($id, $request->user(), 'Deleted by user.');
        return response()->json(['message' => 'Image deleted.']);
    }

    // Admin: moderation queue
    public function pending(Request $request): JsonResponse
    {
        Gate::authorize('moderate', GalleryItem::class);
        $items = $this->galleryService->paginatePending();
        return response()->json(['data' => GalleryItemResource::collection($items)]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        Gate::authorize('moderate', GalleryItem::class);
        $item = $this->galleryService->approve($id, $request->user());
        return response()->json(['item' => new GalleryItemResource($item)]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        Gate::authorize('moderate', GalleryItem::class);
        $request->validate(['reason' => ['required', 'string', 'max:500']]);
        $item = $this->galleryService->reject($id, $request->user(), $request->string('reason'));
        return response()->json(['item' => new GalleryItemResource($item)]);
    }
}
