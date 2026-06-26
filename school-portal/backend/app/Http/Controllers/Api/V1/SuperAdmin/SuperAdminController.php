<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SuperAdminController extends Controller
{
    // ── Audit Logs ─────────────────────────────────────────────
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user:id,first_name,last_name,email')
            ->when($request->has('user_id'), fn($q) => $q->where('user_id', $request->integer('user_id')))
            ->when($request->has('action'),  fn($q) => $q->where('action', $request->string('action')))
            ->when($request->has('from'),    fn($q) => $q->where('created_at', '>=', $request->string('from')))
            ->when($request->has('to'),      fn($q) => $q->where('created_at', '<=', $request->string('to')))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json([
            'data' => $logs->items(),
            'meta' => ['current_page' => $logs->currentPage(), 'last_page' => $logs->lastPage(), 'total' => $logs->total()],
        ]);
    }

    // ── System Settings ────────────────────────────────────────
    public function settings(): JsonResponse
    {
        $settings = SystemSetting::orderBy('group')->orderBy('key')->get();
        return response()->json(['settings' => $settings->groupBy('group')]);
    }

    public function updateSetting(Request $request, string $key): JsonResponse
    {
        $data = $request->validate([
            'value'       => ['required'],
            'description' => ['nullable', 'string'],
            'is_public'   => ['nullable', 'boolean'],
        ]);

        $setting = SystemSetting::where('key', $key)->firstOrFail();
        $setting->update($data);
        Cache::forget("setting:{$key}");

        app(\App\Services\AuditService::class)->log(
            \App\Enums\AuditAction::SettingChanged,
            SystemSetting::class,
            $setting->id,
            ['value' => $setting->getOriginal('value')],
            ['value' => $data['value']],
        );

        return response()->json(['setting' => $setting]);
    }

    // ── Storage Analytics ──────────────────────────────────────
    public function storageStats(): JsonResponse
    {
        $disks = ['gallery', 'library', 'chat-attachments', 'certificates', 'avatars', 'news'];
        $stats = [];

        foreach ($disks as $disk) {
            $publicPath  = storage_path("app/public/{$disk}");
            $privatePath = storage_path("app/private/{$disk}");

            $stats[$disk] = [
                'public_size'   => $this->dirSize($publicPath),
                'private_size'  => $this->dirSize($privatePath),
                'total_files'   => $this->dirCount($publicPath) + $this->dirCount($privatePath),
            ];
        }

        $totalUsed = array_sum(array_map(fn($s) => $s['public_size'] + $s['private_size'], $stats));

        return response()->json([
            'breakdown'  => $stats,
            'total_used' => $totalUsed,
            'total_human'=> $this->humanSize($totalUsed),
        ]);
    }

    // ── Full Analytics ─────────────────────────────────────────
    public function analytics(Request $request): JsonResponse
    {
        $days = $request->integer('days', 30);

        $userGrowth = DB::select("
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '{$days} days'
            GROUP BY DATE(created_at)
            ORDER BY date
        ");

        $messageVolume = DB::select("
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM messages
            WHERE created_at >= NOW() - INTERVAL '{$days} days'
            GROUP BY DATE(created_at)
            ORDER BY date
        ");

        $activeUsers = User::where('last_seen_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'user_growth'    => $userGrowth,
            'message_volume' => $messageVolume,
            'active_users_7d'=> $activeUsers,
            'total_users'    => User::count(),
            'banned_users'   => User::where('is_banned', true)->count(),
        ]);
    }

    // ── User Logs ──────────────────────────────────────────────
    public function userLogs(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $logs = AuditLog::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'user' => ['id' => $user->id, 'full_name' => $user->full_name, 'email' => $user->email],
            'logs' => $logs,
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────
    private function dirSize(string $path): int
    {
        if (!is_dir($path)) return 0;
        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $size += $file->getSize();
        }
        return $size;
    }

    private function dirCount(string $path): int
    {
        if (!is_dir($path)) return 0;
        return iterator_count(new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)));
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        if ($bytes < 1073741824) return round($bytes / 1048576, 1) . ' MB';
        return round($bytes / 1073741824, 2) . ' GB';
    }
}
