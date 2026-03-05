import React, { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'N001', type: 'success', title: 'Order Delivered', message: 'Order #ORD001 successfully delivered', timestamp: '2m ago', read: false, icon: '✓' },
    { id: 'N002', type: 'warning', title: 'Low Stock Alert', message: 'LED Bulb 60W stock running low', timestamp: '15m ago', read: false, icon: '⚠️' },
    { id: 'N003', type: 'info', title: 'New Review', message: 'Fatima Ali gave 5-star review', timestamp: '1h ago', read: false, icon: 'ℹ️' },
    { id: 'N004', type: 'success', title: 'Payment Received', message: 'Payment of $100 processed', timestamp: '2h ago', read: true, icon: '✓' },
    { id: 'N005', type: 'warning', title: 'Delayed Delivery', message: 'Order #ORD003 delayed', timestamp: '3h ago', read: true, icon: '⚠️' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'info': return 'bg-blue-50';
      case 'error': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getIconBgColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'info': return 'bg-blue-100';
      case 'error': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      ></div>

      {/* Notification Panel */}
      <div className="fixed sm:absolute sm:top-full sm:right-0 sm:mt-3 inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto mx-3 sm:mx-0 mb-3 sm:mb-0 w-auto sm:w-96 bg-white rounded-2xl sm:rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[85vh] sm:max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Notifications</h3>
            {unreadCount > 0 && <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-50' : ''}`}
                >
                  <div className="flex gap-2 sm:gap-3">
                    <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${getIconBgColor(notification.type)}`}>
                      {notification.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-xs sm:text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 sm:mt-3">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 text-xs font-medium bg-white hover:bg-blue-50 text-blue-600 rounded transition-colors border border-blue-200"
                      >
                        <Check size={12} />
                        <span className="hidden sm:inline">Read</span>
                        <span className="sm:hidden">✓</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center justify-center px-2 py-1 sm:py-1.5 text-xs font-medium bg-white hover:bg-red-50 text-red-600 rounded transition-colors border border-red-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 sm:h-32 text-gray-500">
              <p className="text-sm">All caught up!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={markAllAsRead}
              className="w-full text-center text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 py-1 sm:py-1.5"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
