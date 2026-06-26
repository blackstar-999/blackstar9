<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password123'])
             ->assertOk()
             ->assertJsonStructure(['user', 'requires_telegram_verification']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])
             ->assertStatus(403);
    }

    public function test_banned_user_cannot_login(): void
    {
        $user = User::factory()->create(['is_banned' => true, 'ban_reason' => 'Test', 'password' => bcrypt('password123')]);
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password123'])
             ->assertStatus(403);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create(['is_active' => false, 'password' => bcrypt('password123')]);
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password123'])
             ->assertStatus(403);
    }

    public function test_me_endpoint_returns_current_user(): void
    {
        $user = User::factory()->verified()->create();
        $this->actingAs($user)->getJson('/api/v1/auth/me')
             ->assertOk()->assertJsonPath('user.email', $user->email);
    }

    public function test_validation_requires_email_and_password(): void
    {
        $this->postJson('/api/v1/auth/login', [])->assertStatus(422)
             ->assertJsonValidationErrors(['email', 'password']);
    }
}
