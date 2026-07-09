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
            'description' => is_array($description) ? json_encode($description) : $description,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'old_data' => is_array($oldData) ? json_encode($oldData) : $oldData,
            'new_data' => is_array($newData) ? json_encode($newData) : $newData,
        ]);
    }
}
