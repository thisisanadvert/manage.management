/**
 * Modal Overlay Fix Utility
 * 
 * This utility provides functions to detect and remove stuck modal overlays
 * that may be blocking user interaction.
 */

/**
 * Detects if there are any modal overlays currently blocking the page
 */
export const detectModalOverlays = (): Element[] => {
  const selectors = [
    '.fixed.inset-0.z-50.bg-background\\/80.backdrop-blur-sm',
    '.fixed.inset-0.z-50',
    '.fixed.inset-0.z-40',
    '.fixed.inset-0.z-30',
    '[class*="fixed"][class*="inset-0"][class*="z-"]',
    '.fixed.inset-0[class*="bg-background"]',
    '.fixed.inset-0[class*="backdrop-blur"]'
  ];

  const overlays: Element[] = [];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Check if element is actually an overlay (has fixed positioning and covers full screen)
        const computedStyle = window.getComputedStyle(element);
        if (
          computedStyle.position === 'fixed' &&
          computedStyle.top === '0px' &&
          computedStyle.left === '0px' &&
          computedStyle.right === '0px' &&
          computedStyle.bottom === '0px'
        ) {
          overlays.push(element);
        }
      });
    } catch (error) {
      console.warn(`Error checking selector ${selector}:`, error);
    }
  });

  return overlays;
};

/**
 * Removes all detected modal overlays from the DOM
 */
export const removeModalOverlays = (): number => {
  const overlays = detectModalOverlays();
  let removedCount = 0;

  overlays.forEach(overlay => {
    try {
      // Log what we're removing for debugging
      console.log('Removing stuck modal overlay:', {
        element: overlay,
        classes: overlay.className,
        id: overlay.id
      });

      // Remove the overlay
      overlay.remove();
      removedCount++;
    } catch (error) {
      console.warn('Error removing overlay:', error);
    }
  });

  // Also restore body scroll if it was disabled
  if (removedCount > 0) {
    document.body.style.overflow = '';
    console.log(`Removed ${removedCount} stuck modal overlay(s)`);
  }

  return removedCount;
};

/**
 * Disables pointer events on modal overlays instead of removing them
 * This is a safer approach that preserves the DOM structure
 */
export const disableModalOverlayInteraction = (): number => {
  const overlays = detectModalOverlays();
  let disabledCount = 0;

  overlays.forEach(overlay => {
    try {
      // Disable pointer events to allow clicks to pass through
      (overlay as HTMLElement).style.pointerEvents = 'none';
      
      // Make it completely transparent
      (overlay as HTMLElement).style.backgroundColor = 'transparent';
      (overlay as HTMLElement).style.backdropFilter = 'none';
      (overlay as HTMLElement).style.webkitBackdropFilter = 'none';
      
      disabledCount++;
      
      console.log('Disabled modal overlay interaction:', {
        element: overlay,
        classes: overlay.className
      });
    } catch (error) {
      console.warn('Error disabling overlay interaction:', error);
    }
  });

  if (disabledCount > 0) {
    console.log(`Disabled interaction on ${disabledCount} modal overlay(s)`);
  }

  return disabledCount;
};

/**
 * Auto-fix function that runs periodically to clean up stuck overlays
 */
export const startModalOverlayAutoFix = (intervalMs: number = 5000): () => void => {
  const interval = setInterval(() => {
    const overlayCount = detectModalOverlays().length;
    if (overlayCount > 0) {
      console.log(`Auto-fix: Found ${overlayCount} modal overlay(s), attempting to fix...`);
      disableModalOverlayInteraction();
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('Modal overlay auto-fix stopped');
  };
};

/**
 * Emergency fix function that can be called from browser console
 * Usage: window.fixModalOverlays()
 */
export const setupEmergencyFix = (): void => {
  (window as any).fixModalOverlays = () => {
    console.log('🚨 Emergency modal overlay fix activated!');
    const removed = removeModalOverlays();
    const disabled = disableModalOverlayInteraction();
    console.log(`✅ Fixed ${removed + disabled} modal overlay issues`);
    return { removed, disabled };
  };

  (window as any).detectModalOverlays = detectModalOverlays;
  
  console.log('🔧 Emergency modal overlay fix functions available:');
  console.log('  - window.fixModalOverlays() - Remove/disable stuck overlays');
  console.log('  - window.detectModalOverlays() - Detect current overlays');
};
