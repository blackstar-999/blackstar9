<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface extends RepositoryInterface
{
    public function findByEmail(string $email): ?User;
    public function findByTelegramId(int $telegramId): ?User;
    public function paginateByRole(?Role $role, int $perPage, ?string $search): LengthAwarePaginator;
    public function countByRole(): array;
    public function updateLastSeen(int $userId): void;
}
