<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $botToken;
    private string $apiBase;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->apiBase  = "https://api.telegram.org/bot{$this->botToken}";
    }

    public function sendVerificationCode(User $user, string $otp): void
    {
        if (!$user->telegram_id) return;

        $message = "🔐 *School Portal Verification*\n\n"
            . "Your verification code: *{$otp}*\n\n"
            . "This code expires in 15 minutes.\n"
            . "_Do not share this code with anyone._";

        $this->sendMessage((int) $user->telegram_id, $message);
    }

    public function sendNotification(int $telegramId, string $text): void
    {
        $this->sendMessage($telegramId, $text);
    }

    public function sendMessage(int $chatId, string $text, array $extra = []): bool
    {
        try {
            $response = Http::timeout(10)->post("{$this->apiBase}/sendMessage", array_merge([
                'chat_id'    => $chatId,
                'text'       => $text,
                'parse_mode' => 'Markdown',
            ], $extra));

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('Telegram API error', ['error' => $e->getMessage(), 'chat_id' => $chatId]);
            return false;
        }
    }

    public function getWebhookInfo(): array
    {
        $response = Http::get("{$this->apiBase}/getWebhookInfo");
        return $response->json();
    }

    public function setWebhook(string $url): bool
    {
        $response = Http::post("{$this->apiBase}/setWebhook", ['url' => $url]);
        return $response->json('ok', false);
    }
}
