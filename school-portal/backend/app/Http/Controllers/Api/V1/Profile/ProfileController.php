<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Profile;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name'  => ['sometimes', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'bio'        => ['nullable', 'string', 'max:1000'],
            'avatar'     => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        $user = $this->userService->updateProfile(
            $request->user(),
            $data,
            $request->hasFile('avatar') ? $request->file('avatar') : null,
        );

        return response()->json(['user' => new UserResource($user)]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password'         => ['required', Password::min(8)->letters()->numbers(), 'confirmed'],
        ]);

        $this->userService->changePassword($request->user(), $request->string('password'));

        return response()->json(['message' => 'Password changed successfully.']);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $notifications]);
    }

    public function markNotificationRead(Request $request, string $notificationId): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read.']);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
