<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\LibraryFileDTO;
use App\Models\LibraryFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class LibraryService
{
    public function __construct(
        private readonly FileStorageService $storageService,
        private readonly AuditService $auditService,
    ) {}

    public function upload(UploadedFile $file, LibraryFileDTO $dto): LibraryFile
    {
        return LibraryFile::create([
            'uploaded_by'       => $dto->uploadedBy,
            'title'             => $dto->title,
            'file_path'         => $dto->filePath,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type'         => $dto->mimeType,
            'file_size'         => $dto->fileSize,
            'author'            => $dto->author,
            'description'       => $dto->description,
            'class_name'        => $dto->className,
            'subject'           => $dto->subject,
            'year'              => $dto->year,
        ]);
    }

    public function paginate(int $perPage, ?string $className, ?string $search): LengthAwarePaginator
    {
        return LibraryFile::active()
            ->when($className, fn($q) => $q->forClass($className))
            ->when($search, fn($q) => $q->whereFullText(['title', 'author', 'description', 'subject'], $search))
            ->with('uploader')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function autocomplete(string $query): array
    {
        return LibraryFile::active()
            ->where(function ($q) use ($query) {
                $q->where('title', 'ilike', "%{$query}%")
                  ->orWhere('author', 'ilike', "%{$query}%")
                  ->orWhere('subject', 'ilike', "%{$query}%");
            })
            ->select('id', 'title', 'author', 'subject')
            ->limit(10)
            ->get()
            ->toArray();
    }

    public function getDownloadUrl(int $fileId): array
    {
        $file = LibraryFile::active()->findOrFail($fileId);
        $file->incrementDownloads();

        $this->auditService->log(\App\Enums\AuditAction::Downloaded, LibraryFile::class, $fileId);

        // Return a temporary signed URL
        $url = Storage::disk('local')->temporaryUrl(
            $file->file_path,
            now()->addMinutes(5),
        );

        return [
            'url'               => $url,
            'original_filename' => $file->original_filename,
            'mime_type'         => $file->mime_type,
        ];
    }

    public function getAvailableClasses(): array
    {
        return LibraryFile::active()
            ->whereNotNull('class_name')
            ->distinct()
            ->orderBy('class_name')
            ->pluck('class_name')
            ->toArray();
    }
}
