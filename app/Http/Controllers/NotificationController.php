<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('notifications/notifications', [
            'pageNotifications' => $notifications
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        if (auth()->id() === $notification->user_id) {
            $notification->update(['is_read' => true]);
        }

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->where('is_read', false)->update(['is_read' => true]);

        return back();
    }
}
