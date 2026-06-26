<?php

declare(strict_types=1);

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'conversation_id' => ['required', 'integer', 'exists:conversations,id'],
            'body'            => ['required_without:attachments', 'nullable', 'string', 'max:5000'],
            'reply_to_id'     => ['nullable', 'integer', 'exists:messages,id'],
            'attachments'     => ['nullable', 'array', 'max:5'],
            'attachments.*'   => ['file', 'max:15360'], // 15MB in KB
        ];
    }
}
