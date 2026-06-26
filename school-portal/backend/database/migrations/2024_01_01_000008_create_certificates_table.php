<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('class_name', 20);
            $table->string('subject');
            $table->string('level');
            $table->string('image_path');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('class_name');
            $table->index('level');
            $table->index('likes_count');
            $table->index(['last_name', 'first_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
