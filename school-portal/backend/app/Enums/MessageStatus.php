<?php

declare(strict_types=1);

namespace App\Enums;

enum MessageStatus: string
{
    case Sent    = 'sent';
    case Edited  = 'edited';
    case Deleted = 'deleted';
}
