<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\AdminStatisticsController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\SuperAdminAuthController;
use App\Http\Controllers\Api\V1\Certificates\CertificateController;
use App\Http\Controllers\Api\V1\Chat\ConversationController;
use App\Http\Controllers\Api\V1\Chat\MessageController;
use App\Http\Controllers\Api\V1\Content\NewsController;
use App\Http\Controllers\Api\V1\Content\PublicController;
use App\Http\Controllers\Api\V1\Gallery\GalleryController;
use App\Http\Controllers\Api\V1\Library\LibraryController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Controllers\Api\V1\Schedule\ScheduleController;
use App\Http\Controllers\Api\V1\SuperAdmin\SuperAdminController;
use Illuminate\Support\Facades\Route;

// ─── API V1 ──────────────────────────────────────────────────────────────────
Route::prefix('v1')->name('api.v1.')->middleware(['api', 'force.json', 'security.headers'])->group(function () {

    // ── Public Routes (no auth required) ─────────────────────────────────────
    Route::prefix('public')->name('public.')->group(function () {
        Route::get('home',           [PublicController::class, 'home']);
        Route::get('contact',        [PublicController::class, 'contact']);
        Route::get('events',         [PublicController::class, 'events']);
        Route::get('news',           [NewsController::class, 'index']);
        Route::get('news/{slug}',    [NewsController::class, 'show']);
        Route::get('gallery',        [GalleryController::class, 'index']);
        Route::get('gallery/{id}',   [GalleryController::class, 'show']);
        Route::get('certificates',   [CertificateController::class, 'index']);
        Route::get('certificates/{id}', [CertificateController::class, 'show']);
        Route::get('library',        [LibraryController::class, 'index']);
        Route::get('library/autocomplete', [LibraryController::class, 'autocomplete']);
        Route::get('schedule/classes', [ScheduleController::class, 'classes']);
        Route::get('schedule/{class}',      [ScheduleController::class, 'show']);
        Route::get('schedule/{class}/date', [ScheduleController::class, 'forDate']);
    });

    // ── Authentication ────────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->middleware('throttle:auth')->group(function () {
        Route::post('login',   [AuthController::class, 'login']);
        Route::post('logout',  [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('me',       [AuthController::class, 'me'])->middleware('auth:sanctum');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('telegram/initiate', [AuthController::class, 'initiateTelegramVerification']);
            Route::post('telegram/verify',   [AuthController::class, 'verifyTelegram']);
        });
    });

    // ── Portal Routes (authenticated + Telegram verified) ────────────────────
    Route::middleware(['auth:sanctum', 'portal.access', 'update.last.seen'])->group(function () {

        // Profile
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/',               [ProfileController::class, 'show']);
            Route::put('/',               [ProfileController::class, 'update']);
            Route::post('change-password',[ProfileController::class, 'changePassword']);
            Route::get('notifications',   [ProfileController::class, 'notifications']);
            Route::post('notifications/{id}/read',    [ProfileController::class, 'markNotificationRead']);
            Route::post('notifications/read-all',     [ProfileController::class, 'markAllNotificationsRead']);
        });

        // Chat
        Route::prefix('chat')->name('chat.')->group(function () {
            Route::get('conversations',           [ConversationController::class, 'index']);
            Route::get('conversations/archived',  [ConversationController::class, 'archived']);
            Route::post('conversations/direct',   [ConversationController::class, 'startDirect']);
            Route::post('conversations/group',    [ConversationController::class, 'createGroup']);
            Route::post('conversations/{id}/archive',   [ConversationController::class, 'archive']);
            Route::post('conversations/{id}/unarchive', [ConversationController::class, 'unarchive']);

            Route::get('conversations/{id}/messages',  [MessageController::class, 'index']);
            Route::post('messages',                    [MessageController::class, 'store']);
            Route::put('messages/{id}',                [MessageController::class, 'update']);
            Route::delete('messages/{id}',             [MessageController::class, 'destroy']);
            Route::post('conversations/{id}/read',     [MessageController::class, 'markRead']);
            Route::get('unread-count',                 [MessageController::class, 'unreadCount']);
            Route::get('attachments/{id}/download',    [MessageController::class, 'downloadAttachment'])->name('attachment.download');
        });

        // Authenticated gallery (likes, upload)
        Route::post('gallery',          [GalleryController::class, 'store'])->middleware('throttle:upload');
        Route::delete('gallery/{id}',   [GalleryController::class, 'destroy']);
        Route::post('gallery/{id}/like',[GalleryController::class, 'toggleLike']);

        // Authenticated certificates
        Route::post('certificates',          [CertificateController::class, 'store'])->middleware('throttle:upload');
        Route::delete('certificates/{id}',   [CertificateController::class, 'destroy']);
        Route::post('certificates/{id}/like',[CertificateController::class, 'toggleLike']);

        // Library (authenticated download)
        Route::get('library/{id}/download', [LibraryController::class, 'download'])->name('library.download');

        // Library upload (librarian+)
        Route::post('library', [LibraryController::class, 'store'])
            ->middleware(['role:librarian', 'throttle:upload']);
        Route::delete('library/{id}', [LibraryController::class, 'destroy'])
            ->middleware('role:librarian');

        // Schedule management (admin, vice_principal, superadmin)
        Route::middleware('role:admin')->group(function () {
            Route::post('schedule', [ScheduleController::class, 'createSchedule']);
            Route::put('schedule/{id}/slots', [ScheduleController::class, 'upsertSlot']);
            Route::delete('schedule/slots/{id}', [ScheduleController::class, 'deleteSlot']);
        });

        // ── Admin Routes ──────────────────────────────────────────────────────
        Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
            // Users
            Route::get('users',                   [AdminUserController::class, 'index']);
            Route::get('users/{id}',              [AdminUserController::class, 'show']);
            Route::post('users',                  [AdminUserController::class, 'store']);
            Route::post('users/{id}/role',        [AdminUserController::class, 'changeRole']);
            Route::post('users/{id}/ban',         [AdminUserController::class, 'ban']);
            Route::post('users/{id}/unban',       [AdminUserController::class, 'unban']);
            Route::delete('users/{id}',           [AdminUserController::class, 'destroy']);

            // Statistics
            Route::get('statistics',              [AdminStatisticsController::class, 'portal']);
            Route::get('school-stats',            [AdminStatisticsController::class, 'schoolStats']);
            Route::put('school-stats/{id}',       [AdminStatisticsController::class, 'updateSchoolStat']);
            Route::post('school-stats',           [AdminStatisticsController::class, 'createSchoolStat']);

            // Gallery moderation
            Route::get('gallery/pending',         [GalleryController::class, 'pending']);
            Route::post('gallery/{id}/approve',   [GalleryController::class, 'approve']);
            Route::post('gallery/{id}/reject',    [GalleryController::class, 'reject']);

            // Content management
            Route::post('news',                   [NewsController::class, 'store']);
            Route::put('news/{id}',               [NewsController::class, 'update']);
            Route::delete('news/{id}',            [NewsController::class, 'destroy']);
        });

        // ── SuperAdmin Routes ─────────────────────────────────────────────────
        Route::prefix('superadmin')->name('superadmin.')->middleware('role:superadmin')->group(function () {
            Route::get('audit-logs',              [SuperAdminController::class, 'auditLogs']);
            Route::get('audit-logs/user/{id}',    [SuperAdminController::class, 'userLogs']);
            Route::get('analytics',               [SuperAdminController::class, 'analytics']);
            Route::get('settings',                [SuperAdminController::class, 'settings']);
            Route::put('settings/{key}',          [SuperAdminController::class, 'updateSetting']);
            Route::get('storage',                 [SuperAdminController::class, 'storageStats']);
        });
    });

    // ── Hidden SuperAdmin Login ───────────────────────────────────────────────
    $superAdminPath = config('app.superadmin_path', 'superadmin-8f4a2b1c');
    Route::post("{$superAdminPath}/login", [SuperAdminAuthController::class, 'login'])
        ->name('superadmin.login')
        ->middleware('throttle:auth');
});
