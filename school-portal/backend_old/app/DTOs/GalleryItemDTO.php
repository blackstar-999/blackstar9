<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class GalleryItemDTO
{
    public function __construct(
        public string  $imagePath,
        public int     $uploadedBy,
        public ?string $caption = null,
        public ?string $albumName = null,
    ) {}

    public static function fromArray(array $data, string $imagePath, int $uploadedBy): self
    {
        return new self(
            imagePath:  $imagePath,
            uploadedBy: $uploadedBy,
            caption:    $data['caption'] ?? null,
            albumName:  $data['album_name'] ?? null,
        );
    }
}
