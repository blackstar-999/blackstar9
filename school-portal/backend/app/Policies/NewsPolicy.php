<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\News;
use App\Models\User;

class NewsPolicy
{
    public function viewAny(?User $user): bool { return true; }

    public function view(?User $user, News $news): bool
    {
        if ($news->status->value === 'published') return true;
        return $user && $user->isAdmin();
    }

    public function create(User $user): bool { return $user->isAdmin(); }
    public function update(User $user, News $news): bool { return $user->isAdmin(); }
    public function delete(User $user, News $news): bool { return $user->isAdmin(); }
}
