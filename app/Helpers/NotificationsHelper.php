<?php

namespace App\Helpers;

use App\Models\Notification;

class NotificationsHelper
{
    public static function notify(int $userId, string $type, string $title, ?string $message = null, ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }
}
