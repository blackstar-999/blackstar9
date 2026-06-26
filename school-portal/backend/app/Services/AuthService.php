<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\UserDTO;
use App\Exceptions\AuthException;
use App\Models\TelegramVerification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private readonly AuditService $auditService,
        private readonly TelegramService $telegramService,
    ) {}

    public function login(string $email, string $password): User
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthException('Invalid credentials.');
        }

        if (!$user->is_active) {
            throw new AuthException('Your account has been deactivated.');
        }

        if ($user->is_banned) {
            throw new AuthException("Your account is banned. Reason: {$user->ban_reason}");
        }

        $this->auditService->logLogin($user->id);

        return $user;
    }

    public function register(UserDTO $dto): User
    {
        return DB::transaction(function () use ($dto) {
            $user = User::create([
                'first_name' => $dto->firstName,
                'last_name'  => $dto->lastName,
                'email'      => $dto->email,
                'phone'      => $dto->phone,
                'role'       => $dto->role,
                'password'   => Hash::make($dto->password ?? Str::random(24)),
                'bio'        => $dto->bio,
                'class_name' => $dto->className,
            ]);

            $this->auditService->logModelEvent(\App\Enums\AuditAction::Created, $user, newValues: ['email' => $user->email, 'role' => $user->role]);

            return $user;
        });
    }

    public function initiateTegramVerification(User $user): TelegramVerification
    {
        // Invalidate previous unused verifications
        TelegramVerification::where('user_id', $user->id)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        $otp   = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $token = Str::random(64);

        $verification = TelegramVerification::create([
            'user_id'    => $user->id,
            'otp'        => $otp,
            'token'      => $token,
            'expires_at' => now()->addMinutes(15),
        ]);

        // Send OTP via Telegram bot
        $this->telegramService->sendVerificationCode($user, $otp);

        return $verification;
    }

    public function verifyTelegram(User $user, string $otp): User
    {
        $verification = TelegramVerification::where('user_id', $user->id)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->latest()
            ->first();

        if (!$verification || !$verification->isValid()) {
            throw new AuthException('Invalid or expired verification code.');
        }

        return DB::transaction(function () use ($user, $verification) {
            $verification->update(['is_used' => true]);

            $user->update([
                'telegram_verified_at' => now(),
                'telegram_id'          => $verification->telegram_id,
                'telegram_username'    => $verification->telegram_username,
            ]);

            return $user->fresh();
        });
    }

    public function superAdminLogin(string $email, string $password): User
    {
        $user = $this->login($email, $password);

        if (!$user->isSuperAdmin()) {
            $this->auditService->log(\App\Enums\AuditAction::Login, null, null, [], ['attempted_superadmin' => true]);
            throw new AuthException('Access denied.');
        }

        return $user;
    }
}
