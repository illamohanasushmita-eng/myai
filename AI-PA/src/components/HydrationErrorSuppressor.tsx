'use client';

import { useEffect } from 'react';

/**
 * Component to suppress hydration warnings caused by browser extensions
 * that modify the DOM (like form fillers, password managers, etc.)
 * 
 * These warnings are harmless and don't affect functionality.
 */
export default function HydrationErrorSuppressor() {
  useEffect(() => {
    // Store the original console.error
    const originalError = console.error;

    // Override console.error to filter out hydration warnings
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || '';
      
      // List of hydration error patterns to suppress
      const hydrationErrorPatterns = [
        'Hydration failed',
        'There was an error while hydrating',
        'Text content does not match',
        'did not match',
        'server rendered HTML',
        'client properties',
        'fdprocessedid', // Browser extension attribute
      ];

      // Check if this is a hydration error
      const isHydrationError = hydrationErrorPatterns.some(pattern =>
        errorMessage.includes(pattern)
      );

      // Only log non-hydration errors
      if (!isHydrationError) {
        originalError.apply(console, args);
      }
    };

    // Cleanup: restore original console.error on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null; // This component doesn't render anything
}

