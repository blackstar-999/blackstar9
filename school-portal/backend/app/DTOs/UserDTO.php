<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Enums\Role;

final readonly class UserDTO
{
    public function __construct(
        public string  $firstName,
        public string  $lastName,
        public string  $email,
        public ?string $phone,
        public Role    $role,
        public ?string $password = null,
        public ?string $avatarPath = null,
        public ?string $bio = null,
        public ?string $className = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            firstName:  $data['first_name'],
            lastName:   $data['last_name'],
            email:      $data['email'],
            phone:      $data['phone'] ?? null,
            role:       Role::from($data['role']),
            password:   $data['password'] ?? null,
            avatarPath: $data['avatar_path'] ?? null,
            bio:        $data['bio'] ?? null,
            className:  $data['class_name'] ?? null,
        );
    }
}
