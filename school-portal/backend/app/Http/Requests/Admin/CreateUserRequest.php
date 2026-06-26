<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:users,email', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'role'       => ['required', new Enum(Role::class)],
            'password'   => ['required', Password::min(8)->letters()->numbers()],
            'class_name' => ['nullable', 'string', 'max:20'],
        ];
    }
}
