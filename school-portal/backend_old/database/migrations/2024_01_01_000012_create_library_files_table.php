<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type', 100);
            $table->unsignedInteger('file_size'); // bytes
            $table->string('author')->nullable();
            $table->text('description')->nullable();
            $table->string('class_name', 20)->nullable();
            $table->string('subject')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('class_name');
            $table->index('subject');
            $table->index('is_active');
            $table->index('title');

            // Full-text search index
            $table->fullText(['title', 'author', 'description', 'subject']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_files');
    }
};
