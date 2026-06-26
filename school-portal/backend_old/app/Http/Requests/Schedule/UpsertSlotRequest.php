<?php

declare(strict_types=1);

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSlotRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'day_of_week'   => ['required', 'integer', 'min:1', 'max:6'],
            'period_number' => ['required', 'integer', 'min:1', 'max:10'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'subject'       => ['required', 'string', 'max:100'],
            'teacher_name'  => ['nullable', 'string', 'max:150'],
            'room'          => ['nullable', 'string', 'max:20'],
            'override_date' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }
}
