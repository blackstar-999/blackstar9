<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\LibraryFile;
use App\Models\User;

class LibraryFilePolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Library is public
    }

    public function create(User $user): bool
    {
        return $user->hasAtLeastRole(Role::Librarian);
    }

    public function update(User $user, LibraryFile $file): bool
    {
        if ($user->isAdmin()) return true;
        return $file->uploaded_by === $user->id && $user->hasAtLeastRole(Role::Librarian);
    }

    public function delete(User $user, LibraryFile $file): bool
    {
        if ($user->isAdmin()) return true;
        return $file->uploaded_by === $user->id && $user->hasAtLeastRole(Role::Librarian);
    }
}
