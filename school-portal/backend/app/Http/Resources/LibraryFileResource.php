<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibraryFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'original_filename' => $this->original_filename,
            'mime_type'         => $this->mime_type,
            'file_size'         => $this->file_size,
            'file_size_human'   => $this->file_size_human,
            'author'            => $this->author,
            'description'       => $this->description,
            'class_name'        => $this->class_name,
            'subject'           => $this->subject,
            'year'              => $this->year,
            'download_count'    => $this->download_count,
            'download_url'      => route('api.v1.library.download', $this->id),
            'created_at'        => $this->created_at->toISOString(),
        ];
    }
}
