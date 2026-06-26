<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            $cacheKey = "user_seen:{$user->id}";

            // Only update DB every 5 minutes to avoid write overhead
            if (!Cache::has($cacheKey)) {
                $user->updateQuietly(['last_seen_at' => now()]);
                Cache::put($cacheKey, true, 300);
            }
        }

        return $next($request);
    }
}
