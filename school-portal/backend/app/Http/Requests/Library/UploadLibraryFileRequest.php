<?php

declare(strict_types=1);

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;

class UploadLibraryFileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'file'        => ['required', 'file', 'max:51200', // 50MB
                              'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpeg,png,webp'],
            'title'       => ['required', 'string', 'max:255'],
            'author'      => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'class_name'  => ['nullable', 'string', 'max:20'],
            'subject'     => ['nullable', 'string', 'max:100'],
            'year'        => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
