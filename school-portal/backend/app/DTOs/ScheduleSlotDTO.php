<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class ScheduleSlotDTO
{
    public function __construct(
        public int     $scheduleId,
        public int     $dayOfWeek,
        public int     $periodNumber,
        public string  $startTime,
        public string  $endTime,
        public string  $subject,
        public ?string $teacherName = null,
        public ?string $room = null,
    ) {}

    public static function fromArray(array $data, int $scheduleId): self
    {
        return new self(
            scheduleId:   $scheduleId,
            dayOfWeek:    (int) $data['day_of_week'],
            periodNumber: (int) $data['period_number'],
            startTime:    $data['start_time'],
            endTime:      $data['end_time'],
            subject:      $data['subject'],
            teacherName:  $data['teacher_name'] ?? null,
            room:         $data['room'] ?? null,
        );
    }
}
