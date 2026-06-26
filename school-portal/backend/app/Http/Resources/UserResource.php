<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'first_name'           => $this->first_name,
            'last_name'            => $this->last_name,
            'full_name'            => $this->full_name,
            'email'                => $this->email,
            'role'                 => $this->role->value,
            'role_label'           => $this->role->label(),
            'phone'                => $this->phone,
            'class_name'           => $this->class_name,
            'avatar_path'          => $this->avatar_path
                ? app(\App\Services\FileStorageService::class)->publicUrl($this->avatar_path)
                : null,
            'bio'                  => $this->bio,
            'telegram_username'    => $this->telegram_username,
            'is_telegram_verified' => $this->isTelegramVerified(),
            'is_active'            => $this->is_active,
            'is_banned'            => $this->is_banned,
            'last_seen_at'         => $this->last_seen_at?->toISOString(),
            'created_at'           => $this->created_at->toISOString(),
        ];
    }
}
