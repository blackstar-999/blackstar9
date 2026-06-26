<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\GalleryItemDTO;
use App\Enums\AuditAction;
use App\Enums\GalleryStatus;
use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GalleryService
{
    public function __construct(
        private readonly FileStorageService $storageService,
        private readonly AuditService $auditService,
    ) {}

    public function upload(UploadedFile $file, GalleryItemDTO $dto): GalleryItem
    {
        $paths = $this->storageService->storeGalleryImage($file);

        return GalleryItem::create([
            'uploaded_by'    => $dto->uploadedBy,
            'image_path'     => $paths['main'],
            'thumbnail_path' => $paths['thumbnail'],
            'caption'        => $dto->caption,
            'album_name'     => $dto->albumName,
            'status'         => GalleryStatus::Pending,
            'file_size'      => $file->getSize(),
        ]);
    }

    public function paginateApproved(int $perPage = 24): LengthAwarePaginator
    {
        return GalleryItem::approved()
            ->orderByPopularity()
            ->paginate($perPage);
    }

    public function paginatePending(int $perPage = 20): LengthAwarePaginator
    {
        return GalleryItem::where('status', GalleryStatus::Pending)
            ->with('uploader')
            ->latest()
            ->paginate($perPage);
    }

    public function approve(int $itemId, User $moderator): GalleryItem
    {
        $item = GalleryItem::findOrFail($itemId);
        $item->update([
            'status'       => GalleryStatus::Approved,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
        ]);

        $this->auditService->logModelEvent(AuditAction::Updated, $item);
        return $item;
    }

    public function reject(int $itemId, User $moderator, string $reason): GalleryItem
    {
        $item = GalleryItem::findOrFail($itemId);
        $item->update([
            'status'           => GalleryStatus::Rejected,
            'rejection_reason' => $reason,
            'moderated_by'     => $moderator->id,
            'moderated_at'     => now(),
        ]);

        $this->storageService->delete($item->image_path);
        if ($item->thumbnail_path) $this->storageService->delete($item->thumbnail_path);

        $this->auditService->logModelEvent(AuditAction::Deleted, $item);
        return $item;
    }

    public function toggleLike(int $itemId, int $userId): array
    {
        $item = GalleryItem::approved()->findOrFail($itemId);

        return DB::transaction(function () use ($item, $userId) {
            $isLiked = DB::table('gallery_likes')
                ->where('gallery_item_id', $item->id)
                ->where('user_id', $userId)
                ->exists();

            if ($isLiked) {
                DB::table('gallery_likes')
                    ->where('gallery_item_id', $item->id)
                    ->where('user_id', $userId)
                    ->delete();
                $item->decrement('likes_count');
                return ['liked' => false, 'likes_count' => $item->likes_count - 1];
            }

            DB::table('gallery_likes')->insert([
                'gallery_item_id' => $item->id,
                'user_id'         => $userId,
                'created_at'      => now(),
            ]);
            $item->increment('likes_count');
            return ['liked' => true, 'likes_count' => $item->likes_count + 1];
        });
    }
}
