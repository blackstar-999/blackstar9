<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository extends EloquentRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByTelegramId(int $telegramId): ?User
    {
        return User::where('telegram_id', $telegramId)->first();
    }

    public function paginateByRole(?Role $role, int $perPage, ?string $search): LengthAwarePaginator
    {
        return User::query()
            ->when($role, fn($q) => $q->where('role', $role))
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            }))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }

    public function countByRole(): array
    {
        return User::selectRaw('role, count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role')
            ->toArray();
    }

    public function updateLastSeen(int $userId): void
    {
        User::where('id', $userId)->update(['last_seen_at' => now()]);
    }
}
