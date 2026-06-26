<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public function log(
        AuditAction $action,
        ?string     $auditableType = null,
        ?int        $auditableId   = null,
        array       $oldValues     = [],
        array       $newValues     = [],
        ?int        $userId        = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id'        => $userId ?? Auth::id(),
            'action'         => $action,
            'auditable_type' => $auditableType,
            'auditable_id'   => $auditableId,
            'old_values'     => empty($oldValues) ? null : $oldValues,
            'new_values'     => empty($newValues) ? null : $newValues,
            'ip_address'     => Request::ip(),
            'user_agent'     => Request::userAgent(),
            'url'            => Request::fullUrl(),
            'method'         => Request::method(),
        ]);
    }

    public function logLogin(int $userId): void
    {
        $this->log(AuditAction::Login, userId: $userId);
    }

    public function logLogout(int $userId): void
    {
        $this->log(AuditAction::Logout, userId: $userId);
    }

    public function logModelEvent(
        AuditAction $action,
        object      $model,
        array       $oldValues = [],
        array       $newValues = [],
    ): void {
        $this->log(
            action:        $action,
            auditableType: get_class($model),
            auditableId:   $model->id,
            oldValues:     $oldValues,
            newValues:     $newValues,
        );
    }
}
