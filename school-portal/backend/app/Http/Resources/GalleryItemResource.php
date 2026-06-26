<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $storage = app(\App\Services\FileStorageService::class);
        $user = $request->user();

        return [
            'id'            => $this->id,
            'image_url'     => $storage->publicUrl($this->image_path),
            'thumbnail_url' => $this->thumbnail_path ? $storage->publicUrl($this->thumbnail_path) : null,
            'caption'       => $this->caption,
            'album_name'    => $this->album_name,
            'status'        => $this->status->value,
            'likes_count'   => $this->likes_count,
            'is_liked'      => $user ? $this->isLikedByUser($user->id) : false,
            'uploaded_by'   => $this->whenLoaded('uploader', fn() => [
                'id'        => $this->uploader->id,
                'full_name' => $this->uploader->full_name,
            ]),
            'created_at'    => $this->created_at->toISOString(),
        ];
    }
}
