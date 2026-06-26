<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $storage = app(\App\Services\FileStorageService::class);

        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'excerpt'      => $this->excerpt,
            'body'         => $this->body,
            'cover_url'    => $this->cover_image_path ? $storage->publicUrl($this->cover_image_path) : null,
            'status'       => $this->status->value,
            'published_at' => $this->published_at?->toISOString(),
            'view_count'   => $this->view_count,
            'tags'         => $this->tags,
            'author'       => $this->whenLoaded('author', fn() => [
                'id'        => $this->author->id,
                'full_name' => $this->author->full_name,
            ]),
            'created_at'   => $this->created_at->toISOString(),
        ];
    }
}
