import React, { useState } from 'react';
import { Bell, Lock, Mail, Shield, Smartphone, ToggleLeft as Toggle, CheckCircle2, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Settings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const PasswordModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPasswordModal(false)} />
        <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Security Settings */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="mr-2 text-primary-600" size={20} />
          Security
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Password</p>
                <p className="text-xs text-gray-500">Last changed 3 months ago</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <Badge variant="error" size="sm">Disabled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                <p className="text-xs text-gray-500">Manage your active sessions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="mr-2 text-primary-600" size={20} />
          Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <Toggle className="h-5 w-5 text-primary-600" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span className="ml-2 text-sm text-gray-700">Announcements</span>
              </div>
              <Toggle className="h-5 w-5 text-primary-600" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span className="ml-2 text-sm text-gray-700">Issue Updates</span>
              </div>
              <Toggle className="h-5 w-5 text-primary-600" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-700">Marketing</span>
              </div>
              <Toggle className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="mr-2 text-primary-600" size={20} />
          Privacy
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Profile Visibility</p>
              <p className="text-xs text-gray-500">Control who can see your profile information</p>
            </div>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option>Building Members</option>
              <option>Directors Only</option>
              <option>Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Data Usage</p>
              <p className="text-xs text-gray-500">Manage how your data is used</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </Card>

      {showPasswordModal && <PasswordModal />}
    </div>
  );
};

export default Settings;