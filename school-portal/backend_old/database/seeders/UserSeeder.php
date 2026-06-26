<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // SuperAdmin
        User::updateOrCreate(
            ['email' => 'superadmin@school.uz'],
            [
                'first_name'           => 'Super',
                'last_name'            => 'Admin',
                'password'             => Hash::make(env('SUPERADMIN_PASSWORD', 'ChangeMe!123')),
                'role'                 => Role::SuperAdmin,
                'is_active'            => true,
                'telegram_verified_at' => now(),
            ]
        );

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@school.uz'],
            [
                'first_name'           => 'School',
                'last_name'            => 'Admin',
                'password'             => Hash::make('Admin!2024'),
                'role'                 => Role::Admin,
                'is_active'            => true,
                'telegram_verified_at' => now(),
            ]
        );

        // Teachers
        $teachers = [
            ['first_name' => 'Malika',   'last_name' => 'Yusupova',   'email' => 'malika@school.uz'],
            ['first_name' => 'Bobur',    'last_name' => 'Toshmatov',  'email' => 'bobur@school.uz'],
            ['first_name' => 'Nilufar',  'last_name' => 'Abdullayeva','email' => 'nilufar@school.uz'],
        ];

        foreach ($teachers as $t) {
            User::updateOrCreate(['email' => $t['email']], array_merge($t, [
                'password'             => Hash::make('Teacher!2024'),
                'role'                 => Role::Teacher,
                'is_active'            => true,
                'telegram_verified_at' => now(),
            ]));
        }

        // Librarian
        User::updateOrCreate(
            ['email' => 'librarian@school.uz'],
            [
                'first_name'           => 'Zulfiya',
                'last_name'            => 'Nazarova',
                'password'             => Hash::make('Lib!2024'),
                'role'                 => Role::Librarian,
                'is_active'            => true,
                'telegram_verified_at' => now(),
            ]
        );

        // Demo students
        $classes  = ['10A', '10B', '11A', '11B'];
        foreach ($classes as $class) {
            for ($i = 1; $i <= 3; $i++) {
                User::factory()->create([
                    'role'                 => Role::Student,
                    'class_name'           => $class,
                    'is_active'            => true,
                    'telegram_verified_at' => now(),
                ]);
            }
        }
    }
}
