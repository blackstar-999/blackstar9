<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsResource;
use App\Models\Event;
use App\Models\News;
use App\Models\SchoolStatistic;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function home(): JsonResponse
    {
        return response()->json([
            'stats'         => SchoolStatistic::visible()->get(),
            'latest_news'   => NewsResource::collection(News::published()->with('author:id,first_name,last_name')->latest('published_at')->limit(6)->get()),
            'upcoming_events' => Event::published()->upcoming()->orderBy('starts_at')->limit(4)->get(),
            'school_info'   => SystemSetting::where('is_public', true)->where('group', 'school')->pluck('value', 'key'),
        ]);
    }

    public function contact(): JsonResponse
    {
        return response()->json([
            'info' => SystemSetting::where('is_public', true)->where('group', 'contact')->pluck('value', 'key'),
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $events = Event::published()
            ->when($request->boolean('upcoming'), fn($q) => $q->upcoming())
            ->orderBy('starts_at')
            ->paginate(10);

        return response()->json(['data' => $events]);
    }
}
