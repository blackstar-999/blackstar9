<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name'           => $this->faker->firstName(),
            'last_name'            => $this->faker->lastName(),
            'email'                => $this->faker->unique()->safeEmail(),
            'email_verified_at'    => now(),
            'password'             => Hash::make('password'),
            'role'                 => Role::Student,
            'phone'                => $this->faker->phoneNumber(),
            'class_name'           => null,
            'is_active'            => true,
            'is_banned'            => false,
            'telegram_verified_at' => null,
            'remember_token'       => Str::random(10),
        ];
    }

    public function teacher(): static
    {
        return $this->state(['role' => Role::Teacher, 'class_name' => null]);
    }

    public function admin(): static
    {
        return $this->state(['role' => Role::Admin, 'class_name' => null, 'telegram_verified_at' => now()]);
    }

    public function verified(): static
    {
        return $this->state(['telegram_verified_at' => now()]);
    }
}
