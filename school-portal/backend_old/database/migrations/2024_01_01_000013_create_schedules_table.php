<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('class_name', 20)->unique();
            $table->string('academic_year', 10); // e.g. "2024-2025"
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('class_name');
            $table->index('is_active');
        });

        Schema::create('schedule_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 1=Monday, 6=Saturday
            $table->unsignedTinyInteger('period_number'); // 1-8
            $table->time('start_time');
            $table->time('end_time');
            $table->string('subject');
            $table->string('teacher_name')->nullable();
            $table->string('room', 20)->nullable();
            $table->boolean('is_override')->default(false);
            $table->date('override_date')->nullable(); // for date-specific overrides
            $table->timestamps();

            $table->index('schedule_id');
            $table->index(['schedule_id', 'day_of_week']);
            $table->unique(['schedule_id', 'day_of_week', 'period_number', 'override_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_slots');
        Schema::dropIfExists('schedules');
    }
};
