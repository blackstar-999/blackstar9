<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        });
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn(Request $r) =>
            Limit::perMinute(60)->by($r->user()?->id ?: $r->ip())
        );

        RateLimiter::for('auth', fn(Request $r) =>
            Limit::perMinute(10)->by($r->ip())
        );

        RateLimiter::for('upload', fn(Request $r) =>
            Limit::perMinute(20)->by($r->user()?->id ?: $r->ip())
        );
    }
}
