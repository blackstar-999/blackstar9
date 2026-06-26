<?php

declare(strict_types=1);

namespace App\Http\Requests\Gallery;

use Illuminate\Foundation\Http\FormRequest;

class UploadGalleryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image'      => ['required', 'image', 'mimes:jpeg,png,webp,gif', 'max:5120'], // 5MB
            'caption'    => ['nullable', 'string', 'max:500'],
            'album_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}
