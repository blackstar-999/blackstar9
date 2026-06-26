<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Library;

use App\DTOs\LibraryFileDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Library\UploadLibraryFileRequest;
use App\Http\Resources\LibraryFileResource;
use App\Models\LibraryFile;
use App\Services\FileStorageService;
use App\Services\LibraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LibraryController extends Controller
{
    public function __construct(
        private readonly LibraryService $libraryService,
        private readonly FileStorageService $storageService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $files = $this->libraryService->paginate(
            $request->integer('per_page', 20),
            $request->string('class_name')->value() ?: null,
            $request->string('search')->value() ?: null,
        );

        return response()->json([
            'data'    => LibraryFileResource::collection($files),
            'classes' => $this->libraryService->getAvailableClasses(),
            'meta'    => ['current_page' => $files->currentPage(), 'last_page' => $files->lastPage(), 'total' => $files->total()],
        ]);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2', 'max:100']]);
        return response()->json(['results' => $this->libraryService->autocomplete($request->string('q'))]);
    }

    public function store(UploadLibraryFileRequest $request): JsonResponse
    {
        Gate::authorize('create', LibraryFile::class);

        $file     = $request->file('file');
        $filePath = $this->storageService->storeLibraryFile($file);

        $dto = LibraryFileDTO::fromArray(
            $request->validated(),
            $filePath,
            $file->getMimeType(),
            $file->getSize(),
            $request->user()->id,
        );

        $libraryFile = $this->libraryService->upload($file, $dto);

        return response()->json(['file' => new LibraryFileResource($libraryFile)], 201);
    }

    public function download(Request $request, int $id): array|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $data = $this->libraryService->getDownloadUrl($id);
        // Return download URL for external opening
        return response()->json(['download_url' => $data['url'], 'filename' => $data['original_filename']]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $file = LibraryFile::findOrFail($id);
        Gate::authorize('delete', $file);
        $this->storageService->delete($file->file_path);
        $file->delete();
        return response()->json(['message' => 'File deleted.']);
    }
}
