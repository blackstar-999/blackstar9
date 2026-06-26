<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Certificates;

use App\DTOs\CertificateDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Certificate\UploadCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use App\Services\CertificateService;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CertificateController extends Controller
{
    public function __construct(
        private readonly CertificateService $certificateService,
        private readonly FileStorageService $storageService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->certificateService->paginate(
            $request->integer('per_page', 20),
            $request->string('class_name')->value() ?: null,
            $request->string('level')->value() ?: null,
            $request->string('search')->value() ?: null,
        );

        return response()->json([
            'data' => CertificateResource::collection($items),
            'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'total' => $items->total()],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::visible()->findOrFail($id);
        return response()->json(['certificate' => new CertificateResource($cert)]);
    }

    public function store(UploadCertificateRequest $request): JsonResponse
    {
        Gate::authorize('create', Certificate::class);

        $imagePath = $this->storageService->storeCertificateImage($request->file('image'));
        $dto = CertificateDTO::fromArray($request->validated(), $imagePath, $request->user()->id);
        $cert = $this->certificateService->upload($request->file('image'), $dto);

        return response()->json(['certificate' => new CertificateResource($cert)], 201);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $result = $this->certificateService->toggleLike($id, $request->user()->id);
        return response()->json($result);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $cert = Certificate::findOrFail($id);
        Gate::authorize('delete', $cert);
        $this->storageService->delete($cert->image_path);
        $cert->delete();
        return response()->json(['message' => 'Certificate deleted.']);
    }
}
