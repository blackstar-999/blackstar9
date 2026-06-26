<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\BusinessException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class FileStorageService
{
    private const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const ALLOWED_DOC_MIMES   = [
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    public function storePublic(UploadedFile $file, string $directory): string
    {
        $filename = $this->generateFilename($file);
        return $file->storeAs("public/{$directory}", $filename, 'local');
    }

    public function storePrivate(UploadedFile $file, string $directory): string
    {
        $filename = $this->generateFilename($file);
        return $file->storeAs("private/{$directory}", $filename, 'local');
    }

    public function storeGalleryImage(UploadedFile $file): array
    {
        $this->validateMime($file, self::ALLOWED_IMAGE_MIMES);
        $this->validateSize($file, config('storage.gallery_max', 5 * 1024 * 1024), '5MB');

        $filename = $this->generateFilename($file);
        $mainPath = "public/gallery/{$filename}";
        $thumbPath = "public/gallery/thumbnails/{$filename}";

        Storage::disk('local')->put($mainPath, file_get_contents($file->getRealPath()));

        // Generate thumbnail
        $thumb = Image::make($file->getRealPath())
            ->fit(400, 400)
            ->encode($file->extension(), 80);
        Storage::disk('local')->put($thumbPath, (string) $thumb);

        return ['main' => $mainPath, 'thumbnail' => $thumbPath];
    }

    public function storeCertificateImage(UploadedFile $file): string
    {
        $this->validateMime($file, self::ALLOWED_IMAGE_MIMES);
        $this->validateSize($file, config('storage.certificate_max', 5 * 1024 * 1024), '5MB');
        return $this->storePublic($file, 'certificates');
    }

    public function storeLibraryFile(UploadedFile $file): string
    {
        $allowed = array_merge(self::ALLOWED_IMAGE_MIMES, self::ALLOWED_DOC_MIMES);
        $this->validateMime($file, $allowed);
        $this->validateSize($file, config('storage.library_max', 50 * 1024 * 1024), '50MB');
        return $this->storePrivate($file, 'library');
    }

    public function delete(string $path): void
    {
        Storage::disk('local')->delete($path);
    }

    public function publicUrl(string $path): string
    {
        // Strip 'public/' prefix for URL generation
        $relative = Str::after($path, 'public/');
        return url("storage/{$relative}");
    }

    private function generateFilename(UploadedFile $file): string
    {
        return Str::uuid() . '.' . $file->getClientOriginalExtension();
    }

    private function validateMime(UploadedFile $file, array $allowed): void
    {
        $mime = $file->getMimeType();
        if (!in_array($mime, $allowed)) {
            throw new BusinessException("File type '{$mime}' is not allowed.");
        }
    }

    private function validateSize(UploadedFile $file, int $maxBytes, string $label): void
    {
        if ($file->getSize() > $maxBytes) {
            throw new BusinessException("File size exceeds the {$label} limit.");
        }
    }
}
