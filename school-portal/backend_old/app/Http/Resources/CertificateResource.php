<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $storage = app(\App\Services\FileStorageService::class);
        $user = $request->user();

        return [
            'id'          => $this->id,
            'first_name'  => $this->first_name,
            'last_name'   => $this->last_name,
            'full_name'   => "{$this->first_name} {$this->last_name}",
            'class_name'  => $this->class_name,
            'subject'     => $this->subject,
            'level'       => $this->level->value,
            'level_label' => $this->level->label(),
            'image_url'   => $storage->publicUrl($this->image_path),
            'description' => $this->description,
            'year'        => $this->year,
            'likes_count' => $this->likes_count,
            'is_liked'    => $user ? $this->isLikedByUser($user->id) : false,
            'created_at'  => $this->created_at->toISOString(),
        ];
    }
}
