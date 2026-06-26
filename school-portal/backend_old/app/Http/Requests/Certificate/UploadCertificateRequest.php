<?php

declare(strict_types=1);

namespace App\Http\Requests\Certificate;

use App\Enums\CertificateLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UploadCertificateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'image'       => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'first_name'  => ['required', 'string', 'max:100'],
            'last_name'   => ['required', 'string', 'max:100'],
            'class_name'  => ['required', 'string', 'max:20'],
            'subject'     => ['required', 'string', 'max:100'],
            'level'       => ['required', new Enum(CertificateLevel::class)],
            'description' => ['nullable', 'string', 'max:1000'],
            'year'        => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
