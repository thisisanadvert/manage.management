import React, { useState } from 'react';
import {
  AlertTriangle,
  Wallet,
  FileText,
  Megaphone,
  Vote,
  Calendar,
  Truck,
  Mail,
  Smartphone,
  Bell,
  Save,
  RotateCcw
} from 'lucide-react';
import { useNotifications, NotificationPreferences as NotificationPrefsType, NotificationType } from '../../contexts/NotificationContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<NotificationPrefsType>(preferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const notificationTypes = [
    {
      type: 'issues' as NotificationType,
      label: 'Issues & Maintenance',
      description: 'Building maintenance issues, repairs, and service requests',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    },
    {
      type: 'finances' as NotificationType,
      label: 'Finances & Payments',
      description: 'Service charges, budgets, and financial updates',
      icon: Wallet,
      color: 'text-green-600 bg-green-100'
    },
    {
      type: 'documents' as NotificationType,
      label: 'Documents',
      description: 'New documents, certificates, and important files',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      type: 'announcements' as NotificationType,
      label: 'Announcements',
      description: 'Building announcements and general updates',
      icon: Megaphone,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      type: 'voting' as NotificationType,
      label: 'Voting & Polls',
      description: 'New polls, voting reminders, and results',
      icon: Vote,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      type: 'agms' as NotificationType,
      label: 'AGMs & Meetings',
      description: 'Annual General Meetings and other building meetings',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      type: 'suppliers' as NotificationType,
      label: 'Suppliers & Services',
      description: 'Supplier updates, service appointments, and contracts',
      icon: Truck,
      color: 'text-gray-600 bg-gray-100'
    }
  ];

  const updatePreference = (
    type: NotificationType,
    channel: 'email' | 'push' | 'inApp' | 'urgentOnly',
    value: boolean
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updatePreferences(localPreferences);
      setHasChanges(false);
      // Show success message (you could add a toast here)
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const toggleAllForType = (type: NotificationType, enabled: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [type]: {
        email: enabled,
        push: enabled,
        inApp: enabled,
        urgentOnly: prev[type].urgentOnly
      }
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose how you want to be notified about different types of building activities
          </p>
        </div>
        {hasChanges && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map(({ type, label, description, icon: Icon, color }) => (
          <Card key={type} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllForType(type, true)}
                    className="text-xs text-green-600 hover:bg-green-50"
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAllForType(type, false)}
                    className="text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Disable All
                  </Button>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* In-App */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">In-App</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[type].inApp}
                      onChange={(e) => updatePreference(type, 'inApp', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[type].email}
                      onChange={(e) => updatePreference(type, 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Push */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Push</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[type].push}
                      onChange={(e) => updatePreference(type, 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Urgent Only */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Urgent Only</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences[type].urgentOnly}
                      onChange={(e) => updatePreference(type, 'urgentOnly', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Global Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Do Not Disturb</p>
              <p className="text-xs text-gray-500">Pause all notifications (except urgent)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Digest</p>
              <p className="text-xs text-gray-500">Receive daily summary instead of individual emails</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Reset Changes
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
