<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditLogService
{
    public static function log($action, $module, $description = null, $oldData = null, $newData = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'old_data' => $oldData,
            'new_data' => $newData,
        ]);
    }
}
