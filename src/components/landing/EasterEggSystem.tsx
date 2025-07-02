import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Heart, Coffee, Zap, Star, Crown, Gift } from 'lucide-react';

interface EasterEgg {
  id: string;
  trigger: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  sound?: string;
}

const easterEggs: EasterEgg[] = [
  {
    id: 'konami',
    trigger: 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,KeyB,KeyA',
    message: 'Konami Code activated! 🎮 You found the classic!',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'bournemouth',
    trigger: 'bournemouth',
    message: 'Made with ❤️ in beautiful Bournemouth! 🏖️',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-400 to-red-500'
  },
  {
    id: 'coffee',
    trigger: 'coffee',
    message: 'Someone needs coffee! ☕ This platform runs on caffeine!',
    icon: <Coffee className="w-6 h-6" />,
    color: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'magic',
    trigger: 'magic',
    message: '✨ Property management magic at your fingertips!',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'triple-click',
    trigger: 'triple-click-logo',
    message: '👑 You found the secret! You must be management material!',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'rtm',
    trigger: 'rtm',
    message: '🏢 Right to Manage - taking control of your building!',
    icon: <Star className="w-6 h-6" />,
    color: 'from-blue-400 to-indigo-500'
  }
];

interface EasterEggSystemProps {
  onLogoClick?: () => void;
}

const EasterEggSystem: React.FC<EasterEggSystemProps> = ({ onLogoClick }) => {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [typedText, setTypedText] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [activeEgg, setActiveEgg] = useState<EasterEgg | null>(null);
  const [foundEggs, setFoundEggs] = useState<Set<string>>(new Set());
  const [easterEggsEnabled, setEasterEggsEnabled] = useState(false);

  // Load found eggs and activation status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('found-easter-eggs');
    if (saved) {
      setFoundEggs(new Set(JSON.parse(saved)));
    }

    const easterEggsActivated = localStorage.getItem('easter-eggs-enabled');
    if (easterEggsActivated === 'true') {
      setEasterEggsEnabled(true);
    }
  }, []);

  // Save found eggs to localStorage
  const saveFoundEgg = useCallback((eggId: string) => {
    const newFoundEggs = new Set(foundEggs);
    newFoundEggs.add(eggId);
    setFoundEggs(newFoundEggs);
    localStorage.setItem('found-easter-eggs', JSON.stringify([...newFoundEggs]));
  }, [foundEggs]);

  // Enable easter eggs
  const enableEasterEggs = useCallback(() => {
    setEasterEggsEnabled(true);
    localStorage.setItem('easter-eggs-enabled', 'true');

    // Show activation message
    setActiveEgg({
      id: 'activation',
      trigger: 'mischiefmanaged',
      message: '🪄 Mischief Managed! Easter eggs are now active! ✨',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-400 to-pink-500'
    });

    setTimeout(() => {
      setActiveEgg(null);
    }, 4000);
  }, []);

  // Show easter egg (only if enabled)
  const showEasterEgg = useCallback((egg: EasterEgg) => {
    if (!easterEggsEnabled) return;

    setActiveEgg(egg);
    saveFoundEgg(egg.id);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setActiveEgg(null);
    }, 4000);
  }, [saveFoundEgg, easterEggsEnabled]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Update key sequence for Konami code
      setKeySequence(prev => {
        const newSequence = [...prev, event.code].slice(-10);
        
        // Check for Konami code
        const konamiEgg = easterEggs.find(egg => egg.id === 'konami');
        if (konamiEgg && newSequence.join(',') === konamiEgg.trigger) {
          showEasterEgg(konamiEgg);
          return [];
        }
        
        return newSequence;
      });

      // Update typed text for word-based triggers
      if (event.key.length === 1) {
        setTypedText(prev => {
          const newText = (prev + event.key.toLowerCase()).slice(-20);

          // Check for activation phrase first
          if (newText.includes('mischiefmanaged') && !easterEggsEnabled) {
            enableEasterEggs();
            return '';
          }

          // Check for word-based easter eggs (only if enabled)
          if (easterEggsEnabled) {
            easterEggs.forEach(egg => {
              if (egg.trigger !== 'konami' && egg.trigger !== 'triple-click-logo' && newText.includes(egg.trigger)) {
                showEasterEgg(egg);
              }
            });
          }

          return newText;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEasterEgg]);

  // Handle logo clicks
  const handleLogoClick = useCallback(() => {
    if (!easterEggsEnabled) {
      // Call the original onLogoClick if provided
      if (onLogoClick) {
        onLogoClick();
      }
      return;
    }

    setLogoClickCount(prev => {
      const newCount = prev + 1;

      if (newCount === 3) {
        const tripleClickEgg = easterEggs.find(egg => egg.id === 'triple-click');
        if (tripleClickEgg) {
          showEasterEgg(tripleClickEgg);
        }
        return 0; // Reset counter
      }

      // Reset counter after 2 seconds if not triple-clicked
      setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);

      return newCount;
    });

    if (onLogoClick) {
      onLogoClick();
    }
  }, [onLogoClick, showEasterEgg, easterEggsEnabled]);

  // Expose logo click handler
  useEffect(() => {
    const logoElement = document.querySelector('[data-logo]');
    if (logoElement) {
      logoElement.addEventListener('click', handleLogoClick);
      return () => logoElement.removeEventListener('click', handleLogoClick);
    }
  }, [handleLogoClick]);

  return (
    <>
      {/* Easter Egg Notification */}
      {activeEgg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1200] animate-bounce">
          <div className={`bg-gradient-to-r ${activeEgg.color} text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 max-w-sm`}>
            {activeEgg.icon}
            <span className="font-medium text-sm">{activeEgg.message}</span>
          </div>
        </div>
      )}

      {/* Easter Egg Counter (only show if easter eggs are enabled and any found) */}
      {easterEggsEnabled && foundEggs.size > 0 && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center space-x-2 text-sm">
            <Gift className="w-4 h-4 text-primary-600" />
            <span className="text-gray-600 font-medium">
              {foundEggs.size}/{easterEggs.length} secrets found
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default EasterEggSystem;
