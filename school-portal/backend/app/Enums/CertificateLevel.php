<?php

declare(strict_types=1);

namespace App\Enums;

enum CertificateLevel: string
{
    case School   = 'school';
    case District = 'district';
    case Regional = 'regional';
    case National = 'national';
    case International = 'international';

    public function label(): string
    {
        return match($this) {
            self::School        => 'School Level',
            self::District      => 'District Level',
            self::Regional      => 'Regional Level',
            self::National      => 'National Level',
            self::International => 'International Level',
        };
    }

    public function sortOrder(): int
    {
        return match($this) {
            self::School        => 1,
            self::District      => 2,
            self::Regional      => 3,
            self::National      => 4,
            self::International => 5,
        };
    }
}
