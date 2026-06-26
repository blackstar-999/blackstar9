<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\ScheduleSlot;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    private array $periods = [
        1 => ['08:00', '08:45'],
        2 => ['08:55', '09:40'],
        3 => ['10:00', '10:45'],
        4 => ['10:55', '11:40'],
        5 => ['12:00', '12:45'],
        6 => ['13:00', '13:45'],
    ];

    private array $subjects = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'History', 'Geography', 'Literature', 'English',
        'Physical Education', 'Computer Science', 'Uzbek Language', 'Art',
    ];

    public function run(): void
    {
        $admin  = User::where('role', 'admin')->first();
        if (!$admin) return;

        $classes = ['10A', '10B', '11A', '11B'];

        foreach ($classes as $className) {
            $schedule = Schedule::updateOrCreate(
                ['class_name' => $className],
                ['academic_year' => '2024-2025', 'is_active' => true, 'created_by' => $admin->id],
            );

            foreach (range(1, 6) as $dayOfWeek) { // Mon-Sat
                $daySubjects = collect($this->subjects)->shuffle()->take(6)->values();

                foreach (range(1, 6) as $periodNumber) {
                    ScheduleSlot::updateOrCreate(
                        ['schedule_id' => $schedule->id, 'day_of_week' => $dayOfWeek, 'period_number' => $periodNumber, 'override_date' => null],
                        [
                            'start_time'  => $this->periods[$periodNumber][0],
                            'end_time'    => $this->periods[$periodNumber][1],
                            'subject'     => $daySubjects[$periodNumber - 1],
                            'is_override' => false,
                        ]
                    );
                }
            }
        }
    }
}
