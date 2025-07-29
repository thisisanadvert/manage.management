/**
 * Emergency Modal Overlay Fix Script
 * 
 * This script can be run directly in the browser console to immediately
 * fix stuck modal overlays that are blocking user interaction.
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. The script will automatically detect and fix any stuck overlays
 */

(function() {
  console.log('🚨 Emergency Modal Overlay Fix - Starting...');

  // Function to detect modal overlays
  function detectModalOverlays() {
    const selectors = [
      '.fixed.inset-0.z-50.bg-background\\/80.backdrop-blur-sm',
      '.fixed.inset-0.z-50',
      '.fixed.inset-0.z-40',
      '.fixed.inset-0.z-30',
      '[class*="fixed"][class*="inset-0"][class*="z-"]',
      '.fixed.inset-0[class*="bg-background"]',
      '.fixed.inset-0[class*="backdrop-blur"]'
    ];

    const overlays = [];
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
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
  }

  // Function to fix overlays
  function fixModalOverlays() {
    const overlays = detectModalOverlays();
    let fixedCount = 0;

    console.log(`Found ${overlays.length} modal overlay(s)`);

    overlays.forEach((overlay, index) => {
      try {
        console.log(`Fixing overlay ${index + 1}:`, {
          element: overlay,
          classes: overlay.className,
          id: overlay.id
        });

        // Method 1: Disable pointer events
        overlay.style.pointerEvents = 'none';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.backdropFilter = 'none';
        overlay.style.webkitBackdropFilter = 'none';
        
        // Method 2: Hide completely
        overlay.style.display = 'none';
        
        // Method 3: Remove from DOM (most aggressive)
        // overlay.remove();
        
        fixedCount++;
      } catch (error) {
        console.warn('Error fixing overlay:', error);
      }
    });

    // Restore body scroll
    document.body.style.overflow = '';
    
    return fixedCount;
  }

  // Run the fix
  const fixedCount = fixModalOverlays();
  
  if (fixedCount > 0) {
    console.log(`✅ Successfully fixed ${fixedCount} modal overlay(s)!`);
    console.log('🎉 You should now be able to interact with the page normally.');
  } else {
    console.log('ℹ️ No modal overlays found that needed fixing.');
  }

  // Add global functions for future use
  window.fixModalOverlays = fixModalOverlays;
  window.detectModalOverlays = detectModalOverlays;
  
  console.log('🔧 Added global functions:');
  console.log('  - window.fixModalOverlays() - Fix stuck overlays');
  console.log('  - window.detectModalOverlays() - Detect current overlays');
  
  console.log('🚨 Emergency Modal Overlay Fix - Complete!');
})();
