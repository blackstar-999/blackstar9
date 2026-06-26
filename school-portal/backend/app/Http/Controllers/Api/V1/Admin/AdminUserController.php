<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\DTOs\UserDTO;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rules\Enum;

class AdminUserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $users = $this->userService->repo()->paginateByRole(
            role:    $request->has('role') ? Role::from($request->string('role')) : null,
            perPage: $request->integer('per_page', 20),
            search:  $request->string('search')->value() ?: null,
        );

        return response()->json([
            'data'  => UserResource::collection($users),
            'meta'  => ['current_page' => $users->currentPage(), 'last_page' => $users->lastPage(), 'total' => $users->total()],
            'stats' => $this->userService->repo()->countByRole(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        Gate::authorize('view', $user);
        return response()->json(['user' => new UserResource($user)]);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        Gate::authorize('create', User::class);
        $dto  = UserDTO::fromArray($request->validated());
        $user = $this->userService->createUser($dto);
        return response()->json(['user' => new UserResource($user)], 201);
    }

    public function changeRole(Request $request, int $id): JsonResponse
    {
        $target = User::findOrFail($id);
        Gate::authorize('changeRole', $target);
        $request->validate(['role' => ['required', new Enum(Role::class)]]);
        $user = $this->userService->changeRole($target, Role::from($request->string('role')), $request->user());
        return response()->json(['user' => new UserResource($user)]);
    }

    public function ban(Request $request, int $id): JsonResponse
    {
        $target = User::findOrFail($id);
        Gate::authorize('ban', $target);
        $request->validate(['reason' => ['required', 'string', 'max:500']]);
        $user = $this->userService->banUser($target, $request->string('reason'), $request->user());
        return response()->json(['user' => new UserResource($user)]);
    }

    public function unban(int $id): JsonResponse
    {
        $target = User::findOrFail($id);
        $user   = $this->userService->unbanUser($target);
        return response()->json(['user' => new UserResource($user)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $target = User::findOrFail($id);
        Gate::authorize('delete', $target);
        $target->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
