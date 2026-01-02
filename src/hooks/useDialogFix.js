import { useEffect } from 'react';

export const useDialogFix = () => {
  useEffect(() => {
    // Clean up any lingering overlays on mount
    const cleanupOverlays = () => {
      const overlays = document.querySelectorAll('.fixed.inset-0.z-50.bg-black\\/80');
      overlays.forEach(overlay => {
        if (overlay.getAttribute('data-state') !== 'open') {
          overlay.remove();
        }
      });
    };

    // Run cleanup on mount and periodically
    cleanupOverlays();
    const interval = setInterval(cleanupOverlays, 1000);

    // Ensure all buttons are clickable
    const fixPointerEvents = () => {
      document.querySelectorAll('button').forEach(btn => {
        if (btn.style.pointerEvents === 'none') {
          btn.style.pointerEvents = 'auto';
        }
      });
    };

    fixPointerEvents();
    const pointerInterval = setInterval(fixPointerEvents, 500);

    return () => {
      clearInterval(interval);
      clearInterval(pointerInterval);
      cleanupOverlays();
    };
  }, []);
};