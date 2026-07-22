<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $notifications = [];
        $unreadCount = 0;

        if ($user) {
            $unreadCount = $user->notifications()->unread()->count();
            $notifications = $user->notifications()
                ->latest('created_at')
                ->take(15)
                ->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'type' => $n->type,
                    'title' => $n->title,
                    'message' => $n->message,
                    'data' => $n->data,
                    'is_read' => $n->is_read,
                    'created_at' => $n->created_at,
                ]);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
                    ? new UserResource($user)->resolve()
                    : null,
            ],
            'page_visits' => $request->attributes->get('page_visits'),
            'notifications' => $notifications,
            'unread_notifications_count' => $unreadCount,
            'stripe_key' => config('stripe.key'),
        ];
    }
}
