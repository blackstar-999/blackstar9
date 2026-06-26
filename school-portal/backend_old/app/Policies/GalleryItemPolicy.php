<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\GalleryStatus;
use App\Enums\Role;
use App\Models\GalleryItem;
use App\Models\User;

class GalleryItemPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, GalleryItem $item): bool
    {
        if ($item->status === GalleryStatus::Approved) return true;
        if (!$user) return false;
        return $user->isAdmin() || $item->uploaded_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isPortalAccessible();
    }

    public function moderate(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, GalleryItem $item): bool
    {
        if ($user->isAdmin()) return true;
        return $item->uploaded_by === $user->id;
    }
}
