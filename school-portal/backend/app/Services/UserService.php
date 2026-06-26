<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\UserDTO;
use App\Enums\AuditAction;
use App\Enums\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $repo,
        private readonly FileStorageService $storageService,
        private readonly AuditService $auditService,
    ) {}

    public function repo(): UserRepositoryInterface
    {
        return $this->repo;
    }

    public function createUser(UserDTO $dto): User
    {
        return DB::transaction(function () use ($dto) {
            $user = $this->repo->create([
                'first_name' => $dto->firstName,
                'last_name'  => $dto->lastName,
                'email'      => $dto->email,
                'phone'      => $dto->phone,
                'role'       => $dto->role,
                'password'   => Hash::make($dto->password ?? \Illuminate\Support\Str::random(24)),
                'class_name' => $dto->className,
                'bio'        => $dto->bio,
            ]);

            $this->auditService->logModelEvent(AuditAction::Created, $user);
            return $user;
        });
    }

    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        return DB::transaction(function () use ($user, $data, $avatar) {
            $old = $user->only(['first_name', 'last_name', 'phone', 'bio']);

            if ($avatar) {
                if ($user->avatar_path) $this->storageService->delete($user->avatar_path);
                $data['avatar_path'] = $this->storageService->storePublic($avatar, 'avatars');
            }

            $updates = array_filter([
                'first_name'  => $data['first_name'] ?? null,
                'last_name'   => $data['last_name'] ?? null,
                'phone'       => $data['phone'] ?? null,
                'bio'         => $data['bio'] ?? null,
                'avatar_path' => $data['avatar_path'] ?? null,
            ], fn($v) => $v !== null);

            $user->update($updates);
            $this->auditService->logModelEvent(AuditAction::Updated, $user, $old, $user->fresh()->only(array_keys($old)));

            return $user->fresh();
        });
    }

    public function changeRole(User $target, Role $newRole, User $actor): User
    {
        if ($newRole === Role::SuperAdmin && !$actor->isSuperAdmin()) {
            throw new \App\Exceptions\AuthException('Only SuperAdmins can grant SuperAdmin role.');
        }

        $old = ['role' => $target->role->value];
        $target->update(['role' => $newRole]);
        $this->auditService->logModelEvent(AuditAction::RoleChanged, $target, $old, ['role' => $newRole->value]);

        return $target->fresh();
    }

    public function banUser(User $target, string $reason, User $actor): User
    {
        if ($target->isSuperAdmin()) {
            throw new \App\Exceptions\AuthException('Cannot ban a SuperAdmin.');
        }

        $target->update([
            'is_banned'  => true,
            'ban_reason' => $reason,
            'banned_at'  => now(),
        ]);

        $this->auditService->logModelEvent(AuditAction::Updated, $target, [], ['banned' => true, 'reason' => $reason]);
        return $target->fresh();
    }

    public function unbanUser(User $target): User
    {
        $target->update(['is_banned' => false, 'ban_reason' => null, 'banned_at' => null]);
        $this->auditService->logModelEvent(AuditAction::Updated, $target, [], ['banned' => false]);
        return $target->fresh();
    }

    public function changePassword(User $user, string $newPassword): void
    {
        $user->update(['password' => Hash::make($newPassword)]);
        $user->tokens()->delete();
    }
}
