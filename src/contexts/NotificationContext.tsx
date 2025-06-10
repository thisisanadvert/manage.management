import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type NotificationType = 
  | 'issues' 
  | 'finances' 
  | 'documents' 
  | 'announcements' 
  | 'voting' 
  | 'agms' 
  | 'suppliers';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  issues: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  finances: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  documents: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  announcements: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  voting: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  agms: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
  suppliers: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    urgentOnly: boolean;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  getFilteredNotifications: (types?: NotificationType[], unreadOnly?: boolean) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const defaultPreferences: NotificationPreferences = {
  issues: { email: true, push: true, inApp: true, urgentOnly: false },
  finances: { email: true, push: false, inApp: true, urgentOnly: true },
  documents: { email: false, push: false, inApp: true, urgentOnly: false },
  announcements: { email: true, push: true, inApp: true, urgentOnly: false },
  voting: { email: true, push: true, inApp: true, urgentOnly: false },
  agms: { email: true, push: true, inApp: true, urgentOnly: false },
  suppliers: { email: false, push: false, inApp: true, urgentOnly: true }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedPreferences = localStorage.getItem(`notification_preferences_${user.id}`);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Error loading notification preferences:', error);
        }
      }

      // Load notifications from localStorage
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })));
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    }
  }, [user?.id]);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(preferences));
    }
  }, [preferences, user?.id]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep only last 100
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };

  const getFilteredNotifications = (types?: NotificationType[], unreadOnly?: boolean) => {
    return notifications.filter(notification => {
      if (types && types.length > 0 && !types.includes(notification.type)) {
        return false;
      }
      if (unreadOnly && notification.read) {
        return false;
      }
      return true;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Add some demo notifications for development
  useEffect(() => {
    if (user?.id && notifications.length === 0) {
      const demoNotifications: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [
        {
          type: 'issues',
          title: 'New Issue Reported',
          message: 'Lift maintenance required - Unit 4B',
          priority: 'high',
          actionUrl: '/issues'
        },
        {
          type: 'announcements',
          title: 'Building Announcement',
          message: 'AGM scheduled for next month',
          priority: 'medium',
          actionUrl: '/announcements'
        },
        {
          type: 'voting',
          title: 'New Poll Available',
          message: 'Vote on new cleaning service provider',
          priority: 'medium',
          actionUrl: '/voting'
        },
        {
          type: 'finances',
          title: 'Service Charge Due',
          message: 'Q4 service charge payment due in 7 days',
          priority: 'high',
          actionUrl: '/finances'
        },
        {
          type: 'documents',
          title: 'New Document',
          message: 'Insurance certificate uploaded',
          priority: 'low',
          actionUrl: '/documents'
        }
      ];

      demoNotifications.forEach(notification => {
        setTimeout(() => addNotification(notification), Math.random() * 1000);
      });
    }
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      preferences,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      updatePreferences,
      getFilteredNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
