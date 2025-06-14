import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Zap, 
  X, 
  Plus, 
  Minus,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    soundEnabled: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 150) {
      updateSetting('fontSize', settings.fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 80) {
      updateSetting('fontSize', settings.fontSize - 10);
    }
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true
    });
  };

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open accessibility options"
        title="Accessibility Options"
      >
        <Accessibility size={20} />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed top-20 right-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Accessibility className="mr-2" size={20} />
              Accessibility
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close accessibility options"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="inline mr-1" size={16} />
                Text Size
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 80}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease font size"
                >
                  <Minus size={16} />
                </button>
                <span className="flex-1 text-center text-sm font-medium">
                  {settings.fontSize}%
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 150}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase font size"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* High Contrast */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Eye size={16} />
                <span className="text-sm font-medium text-gray-700">High Contrast</span>
              </label>
            </div>

            {/* Reduced Motion */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Zap size={16} />
                <span className="text-sm font-medium text-gray-700">Reduce Motion</span>
              </label>
            </div>

            {/* Sound Toggle */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-sm font-medium text-gray-700">Sound Effects</span>
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetSettings}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityToolbar;
