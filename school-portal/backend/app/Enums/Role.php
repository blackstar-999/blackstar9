<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case Guest        = 'guest';
    case Student      = 'student';
    case Teacher      = 'teacher';
    case Librarian    = 'librarian';
    case Admin        = 'admin';
    case VicePrincipal = 'vice_principal';
    case SuperAdmin   = 'superadmin';

    public function label(): string
    {
        return match($this) {
            self::Guest         => 'Guest',
            self::Student       => 'Student',
            self::Teacher       => 'Teacher',
            self::Librarian     => 'Librarian',
            self::Admin         => 'Admin',
            self::VicePrincipal => 'Vice Principal',
            self::SuperAdmin    => 'Super Admin',
        };
    }

    public function hierarchy(): int
    {
        return match($this) {
            self::Guest         => 0,
            self::Student       => 1,
            self::Teacher       => 2,
            self::Librarian     => 3,
            self::Admin         => 4,
            self::VicePrincipal => 5,
            self::SuperAdmin    => 99,
        };
    }

    public function isAtLeast(self $role): bool
    {
        return $this->hierarchy() >= $role->hierarchy();
    }

    public function canManageSchedule(): bool
    {
        return in_array($this, [self::Admin, self::VicePrincipal, self::SuperAdmin]);
    }

    public function canManageContent(): bool
    {
        return in_array($this, [self::Admin, self::SuperAdmin]);
    }

    /** @return self[] */
    public static function portalRoles(): array
    {
        return [self::Student, self::Teacher, self::Librarian, self::Admin, self::VicePrincipal, self::SuperAdmin];
    }
}
