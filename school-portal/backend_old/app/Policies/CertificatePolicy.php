<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Certificate;
use App\Models\User;

class CertificatePolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public access
    }

    public function view(?User $user, Certificate $certificate): bool
    {
        return $certificate->is_visible;
    }

    public function create(User $user): bool
    {
        return $user->hasAtLeastRole(Role::Teacher);
    }

    public function update(User $user, Certificate $certificate): bool
    {
        if ($user->isAdmin()) return true;
        return $certificate->uploaded_by === $user->id;
    }

    public function delete(User $user, Certificate $certificate): bool
    {
        if ($user->isAdmin()) return true;
        return $certificate->uploaded_by === $user->id;
    }

    public function toggleVisibility(User $user): bool
    {
        return $user->isAdmin();
    }
}
