<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\GalleryStatus;
use App\Models\GalleryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GalleryModerationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly GalleryItem $item) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $approved = $this->item->status === GalleryStatus::Approved;

        return [
            'type'             => 'gallery_moderation',
            'gallery_item_id'  => $this->item->id,
            'status'           => $this->item->status->value,
            'message'          => $approved
                ? 'Your photo has been approved and is now visible in the gallery.'
                : "Your photo was not approved. Reason: {$this->item->rejection_reason}",
        ];
    }
}
