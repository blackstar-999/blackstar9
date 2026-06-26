<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Enums\CertificateLevel;

final readonly class CertificateDTO
{
    public function __construct(
        public string           $firstName,
        public string           $lastName,
        public string           $className,
        public string           $subject,
        public CertificateLevel $level,
        public string           $imagePath,
        public int              $uploadedBy,
        public ?string          $description = null,
        public ?int             $year = null,
    ) {}

    public static function fromArray(array $data, string $imagePath, int $uploadedBy): self
    {
        return new self(
            firstName:   $data['first_name'],
            lastName:    $data['last_name'],
            className:   $data['class_name'],
            subject:     $data['subject'],
            level:       CertificateLevel::from($data['level']),
            imagePath:   $imagePath,
            uploadedBy:  $uploadedBy,
            description: $data['description'] ?? null,
            year:        isset($data['year']) ? (int) $data['year'] : null,
        );
    }
}
