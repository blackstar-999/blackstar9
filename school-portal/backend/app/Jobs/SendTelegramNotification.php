<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 30;

    public function __construct(
        public readonly int    $telegramId,
        public readonly string $message,
    ) {}

    public function handle(TelegramService $telegramService): void
    {
        $telegramService->sendNotification($this->telegramId, $this->message);
    }

    public function queue(): string
    {
        return 'notifications';
    }
}
