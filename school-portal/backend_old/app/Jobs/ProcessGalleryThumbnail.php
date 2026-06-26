<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\GalleryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessGalleryThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries   = 3;

    public function __construct(public readonly int $galleryItemId) {}

    public function handle(): void
    {
        $item = GalleryItem::find($this->galleryItemId);
        if (!$item || $item->thumbnail_path) return;

        try {
            $sourcePath = storage_path('app/' . $item->image_path);
            if (!file_exists($sourcePath)) return;

            $thumbDir  = storage_path('app/public/gallery/thumbnails');
            if (!is_dir($thumbDir)) mkdir($thumbDir, 0755, true);

            $filename  = basename($item->image_path);
            $thumbPath = "public/gallery/thumbnails/{$filename}";

            // Use GD if available, fallback to copy
            if (extension_loaded('gd')) {
                $image = imagecreatefromstring(file_get_contents($sourcePath));
                if ($image) {
                    $thumb = imagescale($image, 400, 400, IMG_BICUBIC);
                    $fullThumbPath = storage_path("app/{$thumbPath}");
                    imagejpeg($thumb, $fullThumbPath, 80);
                    imagedestroy($image);
                    imagedestroy($thumb);
                }
            }

            $item->update(['thumbnail_path' => $thumbPath]);
        } catch (\Throwable $e) {
            Log::error('Gallery thumbnail generation failed', [
                'item_id' => $this->galleryItemId,
                'error'   => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function queue(): string
    {
        return 'media';
    }
}
