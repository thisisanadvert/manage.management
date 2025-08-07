/**
 * Audio Utilities for Sonic Branding
 * Handles audio playback for user interactions and branding
 */

export interface AudioConfig {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
  preload?: boolean;
}

export interface SonicBrandingConfig {
  enabled: boolean;
  volume: number;
  respectUserPreferences: boolean;
}

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private config: SonicBrandingConfig = {
    enabled: true,
    volume: 0.7,
    respectUserPreferences: true
  };

  constructor() {
    this.loadConfig();
  }

  /**
   * Load audio configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('sonic-branding-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.warn('Failed to load sonic branding config:', error);
    }
  }

  /**
   * Save audio configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('sonic-branding-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save sonic branding config:', error);
    }
  }

  /**
   * Check if audio should be played based on user preferences
   */
  private shouldPlayAudio(): boolean {
    console.log('🎵 Checking if audio should play...');
    console.log('🎵 Config enabled:', this.config.enabled);

    if (!this.config.enabled) {
      console.log('🎵 Audio disabled in config');
      return false;
    }

    if (this.config.respectUserPreferences) {
      // Check for reduced motion preference (often correlates with audio preferences)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      console.log('🎵 Prefers reduced motion:', prefersReducedMotion);
      if (prefersReducedMotion) {
        console.log('🎵 Audio disabled due to reduced motion preference');
        return false;
      }

      // Check if user has interacted with the page (required for autoplay)
      const hasStoredActivation = (document as any).hasStoredUserActivation;
      const hasFocus = document.hasFocus();
      const hasUserActivation = hasStoredActivation || hasFocus;

      console.log('🎵 Has stored user activation:', hasStoredActivation);
      console.log('🎵 Document has focus:', hasFocus);
      console.log('🎵 Final user activation check:', hasUserActivation);

      // For login scenarios, we'll be more permissive since the user just clicked login
      if (!hasUserActivation) {
        console.log('🎵 No user activation detected, but attempting to play anyway for login');
        return true; // Try to play anyway for login scenarios
      }

      return hasUserActivation;
    }

    console.log('🎵 Audio should play');
    return true;
  }

  /**
   * Preload an audio file
   */
  async preloadAudio(audioPath: string): Promise<HTMLAudioElement> {
    if (this.audioCache.has(audioPath)) {
      return this.audioCache.get(audioPath)!;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = this.config.volume;

      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(audioPath, audio);
        resolve(audio);
      });

      audio.addEventListener('error', (error) => {
        console.warn(`Failed to preload audio: ${audioPath}`, error);
        reject(error);
      });

      audio.src = audioPath;
    });
  }

  /**
   * Play an audio file
   */
  async playAudio(audioPath: string, config: AudioConfig = {}): Promise<void> {
    console.log(`🎵 Attempting to play audio: ${audioPath}`);

    if (!this.shouldPlayAudio()) {
      console.log('🎵 Audio playback blocked by shouldPlayAudio check');
      return;
    }

    try {
      let audio = this.audioCache.get(audioPath);
      console.log(`🎵 Audio cached: ${!!audio}`);

      if (!audio) {
        console.log(`🎵 Preloading audio: ${audioPath}`);
        audio = await this.preloadAudio(audioPath);
        console.log(`🎵 Audio preloaded successfully`);
      }

      // Apply configuration
      audio.volume = config.volume ?? this.config.volume;
      audio.playbackRate = config.playbackRate ?? 1.0;
      audio.loop = config.loop ?? false;

      console.log(`🎵 Audio config - Volume: ${audio.volume}, Rate: ${audio.playbackRate}`);

      // Reset audio to beginning
      audio.currentTime = 0;

      // Play the audio
      console.log(`🎵 Playing audio...`);
      await audio.play();
      console.log(`🎵 Audio played successfully!`);
    } catch (error) {
      console.warn(`🎵 Failed to play audio: ${audioPath}`, error);
      throw error;
    }
  }

  /**
   * Update sonic branding configuration
   */
  updateConfig(newConfig: Partial<SonicBrandingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Update volume for cached audio elements
    this.audioCache.forEach(audio => {
      audio.volume = this.config.volume;
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): SonicBrandingConfig {
    return { ...this.config };
  }

  /**
   * Enable or disable sonic branding
   */
  setEnabled(enabled: boolean): void {
    this.updateConfig({ enabled });
  }

  /**
   * Set volume for all audio
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateConfig({ volume: clampedVolume });
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
  }
}

// Create singleton instance
export const audioService = new AudioService();

/**
 * Sonic branding functions for specific events
 */
export const sonicBranding = {
  /**
   * Play login success sound
   */
  async playLoginSuccess(): Promise<void> {
    await audioService.playAudio('/audio/login-success.mp3', {
      volume: 0.6,
      playbackRate: 1.0
    });
  },

  /**
   * Play login success sound with retry logic for autoplay issues
   */
  async playLoginSuccessWithRetry(): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptPlay = async (): Promise<void> => {
      try {
        await audioService.playAudio('/audio/login-success.mp3', {
          volume: 0.6,
          playbackRate: 1.0
        });
      } catch (error) {
        retryCount++;
        console.log(`🎵 Login sound attempt ${retryCount} failed:`, error);

        if (retryCount < maxRetries) {
          // Wait a bit longer and try again
          await new Promise(resolve => setTimeout(resolve, 200 * retryCount));
          return attemptPlay();
        } else {
          throw error;
        }
      }
    };

    return attemptPlay();
  },

  /**
   * Play login error sound
   */
  async playLoginError(): Promise<void> {
    await audioService.playAudio('/audio/login-error.mp3', {
      volume: 0.5,
      playbackRate: 1.0
    });
  },

  /**
   * Play welcome sound for new users
   */
  async playWelcome(): Promise<void> {
    await audioService.playAudio('/audio/welcome.mp3', {
      volume: 0.7,
      playbackRate: 1.0
    });
  },

  /**
   * Play notification sound
   */
  async playNotification(): Promise<void> {
    await audioService.playAudio('/audio/notification.mp3', {
      volume: 0.4,
      playbackRate: 1.0
    });
  },

  /**
   * Preload all sonic branding audio files
   */
  async preloadAll(): Promise<void> {
    const audioFiles = [
      '/audio/login-success.mp3',
      '/audio/login-error.mp3',
      '/audio/welcome.mp3',
      '/audio/notification.mp3'
    ];

    await Promise.allSettled(
      audioFiles.map(file => audioService.preloadAudio(file))
    );
  }
};

/**
 * Initialize sonic branding system
 */
export const initializeSonicBranding = async (): Promise<void> => {
  try {
    console.log('🎵 Initializing sonic branding system...');

    // Preload audio files when the user first interacts with the page
    const preloadOnInteraction = () => {
      console.log('🎵 User interaction detected, preloading audio files...');
      sonicBranding.preloadAll();
      // Remove listeners after first interaction
      document.removeEventListener('click', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
      document.removeEventListener('touchstart', preloadOnInteraction);
    };

    document.addEventListener('click', preloadOnInteraction, { once: true });
    document.addEventListener('keydown', preloadOnInteraction, { once: true });
    document.addEventListener('touchstart', preloadOnInteraction, { once: true });

    // Add debug function to window for testing
    (window as any).testSonicBranding = async () => {
      console.log('🎵 Testing sonic branding...');
      try {
        await sonicBranding.playLoginSuccess();
        console.log('🎵 Test successful!');
      } catch (error) {
        console.error('🎵 Test failed:', error);
      }
    };

    console.log('🎵 Sonic branding initialized. Test with: window.testSonicBranding()');
  } catch (error) {
    console.warn('Failed to initialize sonic branding:', error);
  }
};
