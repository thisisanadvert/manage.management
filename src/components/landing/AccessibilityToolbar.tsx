import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Type,
  Eye,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
}

const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false
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

    // High contrast - AGGRESSIVE INLINE STYLE APPROACH
    if (settings.highContrast) {
      console.log('🎨 Enabling FULL high contrast mode with inline styles');

      // Apply class to root elements
      root.classList.add('high-contrast');
      document.body.classList.add('high-contrast');

      // AGGRESSIVE: Apply inline styles to EVERY element
      const applyHighContrastStyles = () => {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Skip the accessibility panel itself
            if (element.closest('.accessibility-panel')) return;

            element.style.backgroundColor = 'white';
            element.style.color = 'black';
            element.style.borderColor = 'black';
            element.style.backgroundImage = 'none';
            element.style.boxShadow = 'none';

            // Special handling for primary buttons
            if (element.classList.contains('bg-primary-600') ||
                element.classList.contains('bg-primary-700') ||
                element.classList.contains('bg-primary-500')) {
              element.style.backgroundColor = 'black';
              element.style.color = 'white';
            }
          }
        });
      };

      // Apply immediately and on DOM changes
      applyHighContrastStyles();

      // Watch for new elements
      const observer = new MutationObserver(applyHighContrastStyles);
      observer.observe(document.body, { childList: true, subtree: true });
      (window as any).highContrastObserver = observer;

    } else {
      console.log('🎨 Disabling high contrast mode');

      // Remove classes
      root.classList.remove('high-contrast');
      document.body.classList.remove('high-contrast');

      // Stop observing
      if ((window as any).highContrastObserver) {
        (window as any).highContrastObserver.disconnect();
        delete (window as any).highContrastObserver;
      }

      // Remove all inline styles
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.removeProperty('background-color');
          element.style.removeProperty('color');
          element.style.removeProperty('border-color');
          element.style.removeProperty('background-image');
          element.style.removeProperty('box-shadow');
        }
      });
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
      highContrast: false
    });
  };

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open accessibility options"
        title="Accessibility Options"
      >
        <Accessibility size={20} />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className={`accessibility-panel absolute top-full right-0 mt-2 z-40 rounded-lg shadow-xl border p-4 w-80 max-w-[calc(100vw-2rem)] ${
          settings.highContrast
            ? 'bg-white border-black text-black'
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
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
            <div className={`p-2 rounded-md ${settings.highContrast ? 'bg-black text-white' : 'bg-gray-50'}`}>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => {
                    console.log('🎨 High contrast toggle clicked:', e.target.checked);
                    updateSetting('highContrast', e.target.checked);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Eye size={16} className={settings.highContrast ? 'text-white' : 'text-gray-600'} />
                <span className={`text-sm font-medium ${settings.highContrast ? 'text-white' : 'text-gray-700'}`}>
                  High Contrast {settings.highContrast ? '(Active)' : ''}
                </span>
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
    </div>
  );
};

export default AccessibilityToolbar;
