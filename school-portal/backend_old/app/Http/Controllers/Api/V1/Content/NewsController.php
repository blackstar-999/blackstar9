<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Services\AuditService;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function __construct(
        private readonly FileStorageService $storageService,
        private readonly AuditService $auditService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $news = News::published()
            ->with('author:id,first_name,last_name')
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 10));

        return response()->json(['data' => NewsResource::collection($news), 'meta' => ['current_page' => $news->currentPage(), 'last_page' => $news->lastPage()]]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $news = News::where('slug', $slug)->with('author')->firstOrFail();
        Gate::authorize('view', $news);
        $news->incrementViews();
        $this->auditService->log(\App\Enums\AuditAction::Viewed, News::class, $news->id);
        return response()->json(['news' => new NewsResource($news)]);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', News::class);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'excerpt'     => ['nullable', 'string', 'max:500'],
            'body'        => ['required', 'string'],
            'status'      => ['required', 'in:draft,published'],
            'published_at'=> ['nullable', 'date'],
            'tags'        => ['nullable', 'array'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $this->storageService->storePublic($request->file('cover_image'), 'news');
        }

        $news = News::create([
            'author_id'        => $request->user()->id,
            'title'            => $data['title'],
            'slug'             => Str::slug($data['title']) . '-' . Str::random(6),
            'excerpt'          => $data['excerpt'] ?? null,
            'body'             => $data['body'],
            'status'           => $data['status'],
            'published_at'     => $data['published_at'] ?? ($data['status'] === 'published' ? now() : null),
            'cover_image_path' => $coverPath,
            'tags'             => $data['tags'] ?? null,
        ]);

        return response()->json(['news' => new NewsResource($news)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $news = News::findOrFail($id);
        Gate::authorize('update', $news);

        $data = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'excerpt'     => ['nullable', 'string', 'max:500'],
            'body'        => ['sometimes', 'string'],
            'status'      => ['sometimes', 'in:draft,published,archived'],
            'published_at'=> ['nullable', 'date'],
            'tags'        => ['nullable', 'array'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('cover_image')) {
            if ($news->cover_image_path) $this->storageService->delete($news->cover_image_path);
            $data['cover_image_path'] = $this->storageService->storePublic($request->file('cover_image'), 'news');
        }

        $news->update($data);
        return response()->json(['news' => new NewsResource($news->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        $news = News::findOrFail($id);
        Gate::authorize('delete', $news);
        $news->delete();
        return response()->json(['message' => 'News deleted.']);
    }
}
