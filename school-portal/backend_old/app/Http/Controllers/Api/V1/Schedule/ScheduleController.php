<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Schedule;

use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\UpsertSlotRequest;
use App\Models\Schedule;
use App\Services\ScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleService $scheduleService) {}

    public function classes(): JsonResponse
    {
        return response()->json(['classes' => $this->scheduleService->getAllClasses()]);
    }

    public function show(string $className): JsonResponse
    {
        $schedule = $this->scheduleService->getForClass($className);
        if (!$schedule) return response()->json(['message' => 'No schedule found for this class.'], 404);

        return response()->json(['schedule' => [
            'id'            => $schedule->id,
            'class_name'    => $schedule->class_name,
            'academic_year' => $schedule->academic_year,
            'slots'         => $schedule->regularSlots->groupBy('day_of_week'),
        ]]);
    }

    public function forDate(Request $request, string $className): JsonResponse
    {
        $request->validate(['date' => ['required', 'date']]);
        $date  = new \DateTime($request->string('date'));
        $slots = $this->scheduleService->getSlotsForDate($className, $date);
        return response()->json(['slots' => $slots, 'date' => $request->string('date')]);
    }

    public function upsertSlot(UpsertSlotRequest $request, int $scheduleId): JsonResponse
    {
        $slot = $this->scheduleService->upsertSlot($scheduleId, $request->validated(), $request->user());
        return response()->json(['slot' => $slot], 200);
    }

    public function deleteSlot(Request $request, int $slotId): JsonResponse
    {
        $this->scheduleService->deleteSlot($slotId, $request->user());
        return response()->json(['message' => 'Slot deleted.']);
    }

    public function createSchedule(Request $request): JsonResponse
    {
        $request->validate([
            'class_name'    => ['required', 'string', 'max:20', 'unique:schedules,class_name'],
            'academic_year' => ['required', 'string', 'max:10'],
        ]);

        if (!$request->user()->canManageSchedule()) abort(403);

        $schedule = Schedule::create([
            'class_name'    => $request->string('class_name'),
            'academic_year' => $request->string('academic_year'),
            'created_by'    => $request->user()->id,
        ]);

        return response()->json(['schedule' => $schedule], 201);
    }
}
