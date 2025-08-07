/**
 * Sonic Branding Settings Component
 * Allows users to configure audio preferences
 */

import React from 'react';
import { Volume2, VolumeX, Play, Settings as SettingsIcon } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useSonicBranding } from '../../hooks/useSonicBranding';

const SonicBrandingSettings: React.FC = () => {
  const {
    config,
    setEnabled,
    setVolume,
    playLoginSuccess,
    playWelcome,
    playNotification,
    isEnabled
  } = useSonicBranding();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    setVolume(volume);
  };

  const testSound = async (soundType: 'login' | 'welcome' | 'notification') => {
    try {
      switch (soundType) {
        case 'login':
          await playLoginSuccess();
          break;
        case 'welcome':
          await playWelcome();
          break;
        case 'notification':
          await playNotification();
          break;
      }
    } catch (error) {
      console.warn(`Failed to test ${soundType} sound:`, error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Volume2 className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sonic Branding</h3>
          <p className="text-sm text-gray-600">Configure audio feedback and branding sounds</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Enable Audio Feedback</label>
            <p className="text-xs text-gray-500 mt-1">
              Play sounds for login events and notifications
            </p>
          </div>
          <button
            onClick={() => setEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isEnabled ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Volume Control */}
        {isEnabled && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Volume Level
            </label>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <Volume2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 min-w-[3rem]">
                {Math.round(config.volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Respect User Preferences */}
        {isEnabled && (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Respect Accessibility Preferences</label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically disable sounds if user prefers reduced motion
              </p>
            </div>
            <button
              onClick={() => {
                const newConfig = { respectUserPreferences: !config.respectUserPreferences };
                // We'll need to add this to the hook
                console.log('Toggle respect user preferences:', newConfig);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                config.respectUserPreferences ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.respectUserPreferences ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Test Sounds */}
        {isEnabled && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Test Sounds
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Play size={16} />}
                onClick={() => testSound('login')}
                className="justify-start"
              >
                Login Success
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Play size={16} />}
                onClick={() => testSound('welcome')}
                className="justify-start"
              >
                Welcome
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Play size={16} />}
                onClick={() => testSound('notification')}
                className="justify-start"
              >
                Notification
              </Button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <SettingsIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">About Sonic Branding</h4>
              <p className="text-xs text-blue-700">
                Sonic branding provides audio feedback to enhance your experience with Manage.Management. 
                Sounds are played for successful logins, welcome messages for new users, and important notifications. 
                All audio respects your browser's autoplay policies and accessibility preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Card>
  );
};

export default SonicBrandingSettings;
