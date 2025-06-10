import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Wallet,
  FileText,
  Megaphone,
  Vote,
  Calendar,
  Truck,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  X
} from 'lucide-react';
import { useNotifications, NotificationType, Notification } from '../../contexts/NotificationContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications
  } = useNotifications();

  const [selectedFilters, setSelectedFilters] = useState<NotificationType[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notificationTypes = [
    { type: 'issues' as NotificationType, label: 'Issues', icon: AlertTriangle, color: 'text-red-600' },
    { type: 'finances' as NotificationType, label: 'Finances', icon: Wallet, color: 'text-green-600' },
    { type: 'documents' as NotificationType, label: 'Documents', icon: FileText, color: 'text-blue-600' },
    { type: 'announcements' as NotificationType, label: 'Announcements', icon: Megaphone, color: 'text-purple-600' },
    { type: 'voting' as NotificationType, label: 'Voting', icon: Vote, color: 'text-indigo-600' },
    { type: 'agms' as NotificationType, label: 'AGMs', icon: Calendar, color: 'text-orange-600' },
    { type: 'suppliers' as NotificationType, label: 'Suppliers', icon: Truck, color: 'text-gray-600' }
  ];

  const getTypeConfig = (type: NotificationType) => {
    return notificationTypes.find(t => t.type === type) || notificationTypes[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const toggleFilter = (type: NotificationType) => {
    setSelectedFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const filteredNotifications = getFilteredNotifications(
    selectedFilters.length > 0 ? selectedFilters : undefined,
    showUnreadOnly
  );

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-down">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="primary" size="sm">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile?tab=notifications')}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`text-xs ${showUnreadOnly ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Unread Only
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {notificationTypes.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedFilters.includes(type)
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-3 w-3 mr-1 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          <span className="text-xs text-gray-500">
            {filteredNotifications.length} of {notifications.length}
          </span>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-xs text-gray-500">
              {selectedFilters.length > 0 || showUnreadOnly 
                ? 'No notifications match your filters'
                : 'You\'re all caught up!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const typeConfig = getTypeConfig(notification.type);
              const Icon = typeConfig.icon;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-full bg-white shadow-sm`}>
                      <Icon className={`h-4 w-4 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 ${
                        notification.read ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        <Badge 
                          variant={notification.priority === 'urgent' ? 'danger' : 
                                  notification.priority === 'high' ? 'warning' : 'secondary'}
                          size="sm"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigate('/profile?tab=notifications');
            onClose();
          }}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
        >
          Manage notification preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
