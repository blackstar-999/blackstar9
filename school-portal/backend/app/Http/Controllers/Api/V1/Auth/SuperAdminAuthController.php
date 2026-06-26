<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class SuperAdminAuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'superadmin-login:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json(['message' => "Too many attempts. Retry in {$seconds}s."], 429);
        }

        try {
            $user = $this->authService->superAdminLogin(
                $request->validated('email'),
                $request->validated('password'),
            );

            RateLimiter::clear($key);
            Auth::login($user, remember: false);
            $request->session()->regenerate();

            return response()->json(['user' => new UserResource($user)]);
        } catch (\Throwable) {
            RateLimiter::hit($key, 300);
            return response()->json(['message' => 'Invalid credentials.'], 403);
        }
    }
}
