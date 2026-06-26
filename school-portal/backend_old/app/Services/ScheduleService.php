<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ScheduleService
{
    public function getForClass(string $className): ?Schedule
    {
        return Schedule::where('class_name', $className)
            ->where('is_active', true)
            ->with(['regularSlots'])
            ->first();
    }

    public function getSlotsForDate(string $className, \DateTimeInterface $date): array
    {
        $schedule = Schedule::where('class_name', $className)->where('is_active', true)->first();
        if (!$schedule) return [];

        $dayOfWeek   = (int) $date->format('N'); // 1=Mon, 7=Sun
        $dateString  = $date->format('Y-m-d');

        // Get overrides for this date first
        $overrides = ScheduleSlot::where('schedule_id', $schedule->id)
            ->where('is_override', true)
            ->where('override_date', $dateString)
            ->get()
            ->keyBy('period_number');

        // Get regular slots for this day
        $regular = ScheduleSlot::where('schedule_id', $schedule->id)
            ->where('is_override', false)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        // Merge: overrides take precedence
        return $regular->map(function ($slot) use ($overrides) {
            return $overrides->get($slot->period_number, $slot);
        })->values()->toArray();
    }

    public function upsertSlot(int $scheduleId, array $data, User $editor): ScheduleSlot
    {
        $this->assertCanEdit($scheduleId, $editor);

        return DB::transaction(function () use ($scheduleId, $data, $editor) {
            $slot = ScheduleSlot::updateOrCreate(
                [
                    'schedule_id'   => $scheduleId,
                    'day_of_week'   => $data['day_of_week'],
                    'period_number' => $data['period_number'],
                    'override_date' => $data['override_date'] ?? null,
                    'is_override'   => isset($data['override_date']),
                ],
                [
                    'start_time'   => $data['start_time'],
                    'end_time'     => $data['end_time'],
                    'subject'      => $data['subject'],
                    'teacher_name' => $data['teacher_name'] ?? null,
                    'room'         => $data['room'] ?? null,
                ]
            );

            Schedule::where('id', $scheduleId)->update(['updated_by' => $editor->id]);

            return $slot;
        });
    }

    public function deleteSlot(int $slotId, User $editor): void
    {
        $slot = ScheduleSlot::findOrFail($slotId);
        $this->assertCanEdit($slot->schedule_id, $editor);
        $slot->delete();
    }

    public function getAllClasses(): array
    {
        return Schedule::where('is_active', true)
            ->orderBy('class_name')
            ->pluck('class_name')
            ->toArray();
    }

    private function assertCanEdit(int $scheduleId, User $editor): void
    {
        if (!$editor->canManageSchedule()) {
            throw new \App\Exceptions\AuthException('Insufficient permissions to edit schedules.');
        }
    }
}
