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
    if (!this.config.enabled) {
      return false;
    }

    if (this.config.respectUserPreferences) {
      // Check for reduced motion preference (often correlates with audio preferences)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return false;
      }

      // Check if user has interacted with the page (required for autoplay)
      return document.hasStoredUserActivation || document.hasFocus();
    }

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
    if (!this.shouldPlayAudio()) {
      return;
    }

    try {
      let audio = this.audioCache.get(audioPath);
      
      if (!audio) {
        audio = await this.preloadAudio(audioPath);
      }

      // Apply configuration
      audio.volume = config.volume ?? this.config.volume;
      audio.playbackRate = config.playbackRate ?? 1.0;
      audio.loop = config.loop ?? false;

      // Reset audio to beginning
      audio.currentTime = 0;

      // Play the audio
      await audio.play();
    } catch (error) {
      console.warn(`Failed to play audio: ${audioPath}`, error);
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
    // Preload audio files when the user first interacts with the page
    const preloadOnInteraction = () => {
      sonicBranding.preloadAll();
      // Remove listeners after first interaction
      document.removeEventListener('click', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
      document.removeEventListener('touchstart', preloadOnInteraction);
    };

    document.addEventListener('click', preloadOnInteraction, { once: true });
    document.addEventListener('keydown', preloadOnInteraction, { once: true });
    document.addEventListener('touchstart', preloadOnInteraction, { once: true });
  } catch (error) {
    console.warn('Failed to initialize sonic branding:', error);
  }
};
