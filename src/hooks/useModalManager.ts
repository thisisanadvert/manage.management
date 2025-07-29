import { useEffect, useRef } from 'react';

interface UseModalManagerOptions {
  isOpen: boolean;
  onClose: () => void;
  enableEscapeKey?: boolean;
  enableBodyScrollLock?: boolean;
}

/**
 * Centralized modal management hook to prevent conflicts
 * Handles escape key, body scroll lock, and cleanup
 */
export const useModalManager = ({
  isOpen,
  onClose,
  enableEscapeKey = true,
  enableBodyScrollLock = true
}: UseModalManagerOptions) => {
  const originalOverflowRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      return;
    }

    // Prevent double initialization in StrictMode
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    // Store original overflow value
    originalOverflowRef.current = document.body.style.overflow || '';

    const handleEscape = (e: KeyboardEvent) => {
      if (enableEscapeKey && e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    if (enableEscapeKey) {
      document.addEventListener('keydown', handleEscape);
    }

    // Lock body scroll
    if (enableBodyScrollLock) {
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      if (enableEscapeKey) {
        document.removeEventListener('keydown', handleEscape);
      }
      
      if (enableBodyScrollLock) {
        // Restore original overflow value
        document.body.style.overflow = originalOverflowRef.current;
      }
      
      isInitializedRef.current = false;
    };
  }, [isOpen, onClose, enableEscapeKey, enableBodyScrollLock]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableBodyScrollLock) {
        document.body.style.overflow = originalOverflowRef.current || '';
      }
    };
  }, [enableBodyScrollLock]);
};
