'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Mail, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  deposit_approved: 'bg-green-500',
  deposit_rejected: 'bg-red-500',
  deposit_submitted: 'bg-blue-500',
  withdrawal_approved: 'bg-green-500',
  withdrawal_rejected: 'bg-red-500',
  withdrawal_submitted: 'bg-blue-500',
  kyc_approved: 'bg-green-500',
  kyc_rejected: 'bg-orange-500',
  kyc_submitted: 'bg-blue-500',
  order_approved: 'bg-green-500',
  order_rejected: 'bg-red-500',
  order_submitted: 'bg-blue-500',
  appointment_approved: 'bg-accent',
  appointment_rejected: 'bg-red-500',
  appointment_submitted: 'bg-blue-500',
  support_ticket_created: 'bg-purple-500',
  support_ticket_reply: 'bg-purple-500',
  giveaway_entry: 'bg-yellow-500',
  password_changed: 'bg-orange-500',
  welcome: 'bg-accent',
  general: 'bg-blue-500',
};

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n: Notification) => !n.isRead).length);
        }
      }
    } catch (error) {
      console.error('[v0] Failed to fetch notifications:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 30s for new notifications
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchNotifications(true), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  // Re-fetch when dropdown opens
  const handleOpen = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) fetchNotifications(true);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[v0] Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string, wasUnread: boolean) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
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

  const dotColor = (type: string) => TYPE_COLORS[type] ?? 'bg-accent';

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative p-1.5 rounded-lg hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5 text-white/60 hover:text-accent" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-accent"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-white/[0.05]">
            {isLoading ? (
              <div className="p-6 text-xs text-muted-foreground text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Mail className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Updates on deposits, withdrawals, and more will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-white/5 transition-colors ${
                    !notification.isRead ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Type dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotColor(notification.type)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`text-xs font-semibold leading-snug ${!notification.isRead ? 'text-foreground' : 'text-foreground/70'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={() => deleteNotification(notification.id, !notification.isRead)}
                          className="p-0.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                          aria-label="Dismiss notification"
                        >
                          <X className="w-3 h-3 text-white/30 hover:text-white/60" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground/50">
                          {formatDate(notification.createdAt)}
                        </p>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-[10px] text-accent hover:text-accent/80 transition-colors font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/10 text-center">
              <p className="text-[10px] text-muted-foreground/50">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
