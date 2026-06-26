<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->string('value');
            $table->string('unit')->nullable(); // "students", "teachers", "years"
            $table->string('icon')->nullable(); // icon name for frontend
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index('sort_order');
            $table->index('is_visible');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_statistics');
    }
};
