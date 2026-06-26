<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'Your account has been suspended.', 'reason' => $user->ban_reason], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Your account is inactive.'], 403);
        }

        if (!$user->isTelegramVerified()) {
            return response()->json([
                'message'        => 'Telegram verification required.',
                'requires_telegram_verification' => true,
            ], 403);
        }

        return $next($request);
    }
}
