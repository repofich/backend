<?php

namespace App\Http\Controllers\Inertia;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $user = request()->user();

        $notifications = $user->notifications()
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('Notifications', [
            'notifications' => $notifications->through(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'message' => $n->message,
                'data' => $n->data,
                'is_read' => $n->is_read,
                'created_at' => $n->created_at,
            ]),
        ]);
    }

    public function markRead(Notification $notification)
    {
        if ($notification->user_id !== request()->user()->id) {
            abort(403);
        }

        $notification->update(['is_read' => true]);

        return back();
    }

    public function markAllRead()
    {
        request()->user()->notifications()->unread()->update(['is_read' => true]);

        return back();
    }
}
