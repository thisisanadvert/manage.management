# Sonic Branding Audio Files

This directory contains audio files for the Manage.Management sonic branding system.

## Required Audio Files

To complete the sonic branding setup, please add the following audio files to this directory:

### Primary Files
- `login-success.mp3` - Played when users successfully log in
- `login-error.mp3` - Played when login fails (optional)
- `welcome.mp3` - Played for new users on first login
- `notification.mp3` - Played for important notifications (optional)

### Audio File Requirements

**Format**: MP3 (recommended) or WAV
**Duration**: 0.5 - 3 seconds (keep it brief)
**File Size**: Under 100KB per file (for fast loading)
**Sample Rate**: 44.1kHz or 48kHz
**Bit Rate**: 128kbps or higher

### Recommended Audio Characteristics

**Login Success Sound**:
- Positive, uplifting tone
- Clear, crisp sound
- Duration: 1-2 seconds
- Volume: Moderate (will be adjusted by user preferences)

**Welcome Sound**:
- Warm, welcoming tone
- Slightly longer than login success (2-3 seconds)
- Can be more elaborate as it's for special occasions

**Error Sound**:
- Subtle, non-alarming
- Brief (0.5-1 second)
- Lower pitch than success sounds

**Notification Sound**:
- Attention-getting but not intrusive
- Clear and recognisable
- Duration: 0.5-1.5 seconds

## Implementation Notes

- Audio files are automatically preloaded after the first user interaction
- The system respects user preferences for reduced motion/audio
- Volume is user-controllable through settings
- All audio playback follows browser autoplay policies
- Files are cached for performance

## Testing

Once you've added your audio files, you can test them through:
1. The Settings page → Sonic Branding section
2. Actual login/logout flows
3. Browser developer console: `window.testSonicBranding()`

## Browser Compatibility

The sonic branding system supports:
- Chrome 66+
- Firefox 66+
- Safari 12+
- Edge 79+

## Accessibility

The system automatically:
- Respects `prefers-reduced-motion` settings
- Provides user controls for enabling/disabling audio
- Includes volume controls
- Gracefully degrades when audio is not supported

## File Naming Convention

Please use exactly these filenames:
- `login-success.mp3`
- `login-error.mp3` 
- `welcome.mp3`
- `notification.mp3`

The system expects these exact names and will not work with different filenames.
