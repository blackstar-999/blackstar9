<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class LibraryFileDTO
{
    public function __construct(
        public string  $title,
        public string  $filePath,
        public string  $mimeType,
        public int     $fileSize,
        public int     $uploadedBy,
        public ?string $author = null,
        public ?string $description = null,
        public ?string $className = null,
        public ?string $subject = null,
        public ?int    $year = null,
    ) {}

    public static function fromArray(array $data, string $filePath, string $mimeType, int $fileSize, int $uploadedBy): self
    {
        return new self(
            title:       $data['title'],
            filePath:    $filePath,
            mimeType:    $mimeType,
            fileSize:    $fileSize,
            uploadedBy:  $uploadedBy,
            author:      $data['author'] ?? null,
            description: $data['description'] ?? null,
            className:   $data['class_name'] ?? null,
            subject:     $data['subject'] ?? null,
            year:        isset($data['year']) ? (int) $data['year'] : null,
        );
    }
}
