<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\TelegramVerifyRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly AuditService $auditService,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
        );

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($user),
            'requires_telegram_verification' => !$user->isTelegramVerified(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $userId = Auth::id();
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $this->auditService->logLogout($userId);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function initiateTelegramVerification(Request $request): JsonResponse
    {
        $verification = $this->authService->initiateTegramVerification($request->user());

        return response()->json([
            'message'    => 'Verification code sent via Telegram.',
            'token'      => $verification->token,
            'expires_at' => $verification->expires_at->toISOString(),
        ]);
    }

    public function verifyTelegram(TelegramVerifyRequest $request): JsonResponse
    {
        $user = $this->authService->verifyTelegram(
            $request->user(),
            $request->validated('otp'),
        );

        return response()->json([
            'message' => 'Telegram verified successfully.',
            'user'    => new UserResource($user),
        ]);
    }
}
