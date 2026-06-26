<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Certificate;
use App\Models\GalleryItem;
use App\Models\LibraryFile;
use App\Models\Message;
use App\Models\News;
use App\Models\User;
use App\Policies\CertificatePolicy;
use App\Policies\GalleryItemPolicy;
use App\Policies\LibraryFilePolicy;
use App\Policies\MessagePolicy;
use App\Policies\NewsPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class        => UserPolicy::class,
        News::class        => NewsPolicy::class,
        Certificate::class => CertificatePolicy::class,
        GalleryItem::class => GalleryItemPolicy::class,
        LibraryFile::class => LibraryFilePolicy::class,
        Message::class     => MessagePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // SuperAdmin bypasses all gates
        Gate::before(function (User $user, string $ability) {
            if ($user->isSuperAdmin()) return true;
        });
    }
}
