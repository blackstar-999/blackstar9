<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\GalleryItem;
use App\Models\LibraryFile;
use App\Models\Message;
use App\Models\News;
use App\Models\SchoolStatistic;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatisticsController extends Controller
{
    public function portal(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total'    => User::count(),
                'active'   => User::where('is_active', true)->count(),
                'by_role'  => User::selectRaw('role, count(*) as total')->groupBy('role')->pluck('total', 'role'),
                'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
            ],
            'content' => [
                'news'         => News::count(),
                'gallery'      => GalleryItem::approved()->count(),
                'library'      => LibraryFile::active()->count(),
                'certificates' => Certificate::visible()->count(),
            ],
            'activity' => [
                'messages_today'     => Message::whereDate('created_at', today())->count(),
                'messages_this_week' => Message::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ],
        ]);
    }

    public function schoolStats(): JsonResponse
    {
        $stats = SchoolStatistic::visible()->get();
        return response()->json(['stats' => $stats]);
    }

    public function updateSchoolStat(Request $request, int $id): JsonResponse
    {
        $stat = SchoolStatistic::findOrFail($id);
        $data = $request->validate([
            'label'      => ['sometimes', 'string', 'max:100'],
            'value'      => ['required', 'string', 'max:100'],
            'unit'       => ['nullable', 'string', 'max:50'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer'],
            'is_visible' => ['sometimes', 'boolean'],
        ]);
        $stat->update($data);
        return response()->json(['stat' => $stat]);
    }

    public function createSchoolStat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key'        => ['required', 'string', 'unique:school_statistics,key'],
            'label'      => ['required', 'string', 'max:100'],
            'value'      => ['required', 'string', 'max:100'],
            'unit'       => ['nullable', 'string', 'max:50'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $stat = SchoolStatistic::create($data);
        return response()->json(['stat' => $stat], 201);
    }
}
