'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Mail } from 'lucide-react';

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          if (data.notifications) {
            setNotifications(data.notifications);
            const unread = data.notifications.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        }
      } catch (error) {
        console.error('[v0] Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('[v0] Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('[v0] Failed to delete notification:', error);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return d.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5 text-white/60 hover:text-accent" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-white/10 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-xs text-muted-foreground text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors ${
                    !notification.isRead ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground line-clamp-2">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-white/40 hover:text-white/60" />
                    </button>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <button className="text-xs text-accent hover:text-accent/80 transition-colors font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
