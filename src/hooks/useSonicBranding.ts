/**
 * React Hook for Sonic Branding
 * Provides easy access to audio functionality in React components
 */

import { useCallback, useEffect, useState } from 'react';
import { audioService, sonicBranding, SonicBrandingConfig } from '../utils/audioUtils';

export interface UseSonicBrandingReturn {
  // Configuration
  config: SonicBrandingConfig;
  updateConfig: (config: Partial<SonicBrandingConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  
  // Audio playback functions
  playLoginSuccess: () => Promise<void>;
  playLoginError: () => Promise<void>;
  playWelcome: () => Promise<void>;
  playNotification: () => Promise<void>;
  
  // Utility functions
  preloadAll: () => Promise<void>;
  isEnabled: boolean;
}

/**
 * Hook for sonic branding functionality
 */
export const useSonicBranding = (): UseSonicBrandingReturn => {
  const [config, setConfig] = useState<SonicBrandingConfig>(audioService.getConfig());

  // Update local state when config changes
  useEffect(() => {
    const updateLocalConfig = () => {
      setConfig(audioService.getConfig());
    };

    // Listen for storage changes (if config is updated in another tab)
    window.addEventListener('storage', updateLocalConfig);
    
    return () => {
      window.removeEventListener('storage', updateLocalConfig);
    };
  }, []);

  // Configuration functions
  const updateConfig = useCallback((newConfig: Partial<SonicBrandingConfig>) => {
    audioService.updateConfig(newConfig);
    setConfig(audioService.getConfig());
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    audioService.setEnabled(enabled);
    setConfig(audioService.getConfig());
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioService.setVolume(volume);
    setConfig(audioService.getConfig());
  }, []);

  // Audio playback functions
  const playLoginSuccess = useCallback(async () => {
    try {
      console.log('🎵 Hook: playLoginSuccess called, config:', config);
      await sonicBranding.playLoginSuccess();
    } catch (error) {
      console.warn('Failed to play login success sound:', error);
      throw error;
    }
  }, [config]);

  const playLoginError = useCallback(async () => {
    try {
      await sonicBranding.playLoginError();
    } catch (error) {
      console.warn('Failed to play login error sound:', error);
    }
  }, []);

  const playWelcome = useCallback(async () => {
    try {
      await sonicBranding.playWelcome();
    } catch (error) {
      console.warn('Failed to play welcome sound:', error);
    }
  }, []);

  const playNotification = useCallback(async () => {
    try {
      await sonicBranding.playNotification();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, []);

  const preloadAll = useCallback(async () => {
    try {
      await sonicBranding.preloadAll();
    } catch (error) {
      console.warn('Failed to preload audio files:', error);
    }
  }, []);

  return {
    config,
    updateConfig,
    setEnabled,
    setVolume,
    playLoginSuccess,
    playLoginError,
    playWelcome,
    playNotification,
    preloadAll,
    isEnabled: config.enabled
  };
};

/**
 * Hook for login-specific sonic branding
 * Automatically plays appropriate sounds based on login events
 */
export const useLoginSonicBranding = () => {
  const { playLoginSuccess, playLoginError, playWelcome, isEnabled } = useSonicBranding();

  const handleLoginSuccess = useCallback(async (isNewUser: boolean = false) => {
    if (!isEnabled) return;

    try {
      if (isNewUser) {
        // Play welcome sound for new users
        await playWelcome();
      } else {
        // Play login success sound for returning users
        await playLoginSuccess();
      }
    } catch (error) {
      console.warn('Failed to play login success audio:', error);
    }
  }, [playLoginSuccess, playWelcome, isEnabled]);

  const handleLoginError = useCallback(async () => {
    if (!isEnabled) return;

    try {
      await playLoginError();
    } catch (error) {
      console.warn('Failed to play login error audio:', error);
    }
  }, [playLoginError, isEnabled]);

  return {
    handleLoginSuccess,
    handleLoginError,
    isEnabled
  };
};
