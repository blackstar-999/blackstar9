<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CertificateDTO;
use App\Models\Certificate;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CertificateService
{
    public function __construct(
        private readonly FileStorageService $storageService,
        private readonly AuditService $auditService,
    ) {}

    public function upload(UploadedFile $file, CertificateDTO $dto): Certificate
    {
        return Certificate::create([
            'uploaded_by' => $dto->uploadedBy,
            'first_name'  => $dto->firstName,
            'last_name'   => $dto->lastName,
            'class_name'  => $dto->className,
            'subject'     => $dto->subject,
            'level'       => $dto->level,
            'image_path'  => $dto->imagePath,
            'description' => $dto->description,
            'year'        => $dto->year,
        ]);
    }

    public function paginate(int $perPage, ?string $className, ?string $level, ?string $search): LengthAwarePaginator
    {
        return Certificate::visible()
            ->when($className, fn($q) => $q->where('class_name', $className))
            ->when($level, fn($q) => $q->where('level', $level))
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('subject', 'ilike', "%{$search}%");
            }))
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function toggleLike(int $certificateId, int $userId): array
    {
        $cert = Certificate::visible()->findOrFail($certificateId);

        return DB::transaction(function () use ($cert, $userId) {
            $isLiked = DB::table('certificate_likes')
                ->where('certificate_id', $cert->id)
                ->where('user_id', $userId)
                ->exists();

            if ($isLiked) {
                DB::table('certificate_likes')
                    ->where('certificate_id', $cert->id)
                    ->where('user_id', $userId)
                    ->delete();
                $cert->decrement('likes_count');
                return ['liked' => false, 'likes_count' => $cert->likes_count - 1];
            }

            DB::table('certificate_likes')->insert([
                'certificate_id' => $cert->id,
                'user_id'        => $userId,
                'created_at'     => now(),
            ]);
            $cert->increment('likes_count');
            return ['liked' => true, 'likes_count' => $cert->likes_count + 1];
        });
    }
}
