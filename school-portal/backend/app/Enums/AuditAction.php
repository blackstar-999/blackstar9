<?php

declare(strict_types=1);

namespace App\Enums;

enum AuditAction: string
{
    case Created  = 'created';
    case Updated  = 'updated';
    case Deleted  = 'deleted';
    case Login    = 'login';
    case Logout   = 'logout';
    case Viewed   = 'viewed';
    case Uploaded = 'uploaded';
    case Downloaded = 'downloaded';
    case RoleChanged = 'role_changed';
    case SettingChanged = 'setting_changed';
}
