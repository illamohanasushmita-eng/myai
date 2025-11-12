/**
 * useLara Hook
 * React hook wrapper for Lara Voice Assistant
 * 
 * Usage:
 * const { isRunning, start, stop } = useLara({ userId });
 * 
 * <button onClick={start}>Start Lara</button>
 * <button onClick={stop}>Stop Lara</button>
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  startLaraAssistant,
  stopLaraAssistant,
  setLaraRunning,
  abortCurrentRecognition,
  LaraContext,
} from '@/lib/voice/lara-assistant';
import { automateSpotifyPlayback } from '@/lib/voice/spotify-automation';
import { addTaskVoice } from '@/lib/voice/task-automation';
import { addReminderVoice } from '@/lib/voice/reminder-automation';

export interface UseLaraOptions {
  userId: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onTaskStatusChange?: (status: 'processing' | 'completed' | 'error', message?: string) => void;
  onListeningStateChange?: (state: 'wake-word' | 'command' | 'processing' | 'idle') => void;
  oneShot?: boolean; // If true, stop after one command
}

export interface UseLaraReturn {
  isRunning: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  restart: () => void;
}

export function useLara({
  userId,
  enabled = true,
  onError,
  onTaskStatusChange,
  onListeningStateChange,
  oneShot = true, // Default to one-shot mode
}: UseLaraOptions) {
  const router = useRouter();

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assistantLoopRef = useRef<Promise<void> | null>(null);
  const shouldContinueRef = useRef(true);

  // Create Lara context
  const createContext = useCallback((): LaraContext => {
    console.log('🔧 Creating Lara context with router:', !!router);
    const context: LaraContext = {
      userId,
      router,
      onNavigate: (path: string) => {
        console.log('🔧 onNavigate called with path:', path);
        console.log('🔧 Router object:', router);
        console.log('🔧 Router.push type:', typeof router?.push);

        // Execute navigation immediately (no setTimeout delay)
        // This ensures navigation happens as soon as intent is handled
        try {
          console.log('🔧 Executing router.push for path:', path);
          router.push(path);
          console.log('🔧 router.push completed');
        } catch (error) {
          console.error('🔧 Error during router.push:', error);
        }
      },
      onPlayMusic: async (query: string) => {
        await automateSpotifyPlayback(query, userId);
      },
      onAddTask: async (text: string) => {
        await addTaskVoice(text, userId, context.onNavigate);
      },
      onAddReminder: async (text: string, time?: string) => {
        // Try to get the optimistic add function from reminders page (stored on window)
        let onReminderCreated: ((reminder: any) => void) | undefined = undefined;
        if (typeof window !== 'undefined' && (window as any).__addReminderOptimistically) {
          onReminderCreated = (window as any).__addReminderOptimistically;
          console.log('📌 [LARA] Found optimistic add function on window');
        } else {
          console.log('📌 [LARA] Optimistic add function not available (reminders page may not be mounted)');
        }
        await addReminderVoice(text, userId, time, context.onNavigate, onReminderCreated);
      },
      onTaskStatusChange,
      onListeningStateChange,
      oneShot,
    };
    console.log('🔧 Context created:', {
      hasOnNavigate: !!context.onNavigate,
      hasRouter: !!context.router,
      userId: context.userId,
      oneShot
    });
    return context;
  }, [userId, router, onTaskStatusChange, onListeningStateChange, oneShot]);

  // Start Lara Assistant
  const start = useCallback(async () => {
    if (isRunning) return;

    try {
      setError(null);
      setIsRunning(true);
      shouldContinueRef.current = true;

      const context = createContext();

      // Start the assistant loop (don't await - let it run in background)
      assistantLoopRef.current = startLaraAssistant(context);
      // Don't await here - the loop runs continuously until stopped
      assistantLoopRef.current
        .then(() => {
          // Loop completed successfully (e.g., in one-shot mode)
          console.log('🛑 Assistant loop completed successfully');
          setIsRunning(false);
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error.message);
          onError?.(error);
          setIsRunning(false);
        });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message);
      onError?.(error);
      setIsRunning(false);
    }
  }, [isRunning, createContext, onError]);

  // Stop Lara Assistant
  const stop = useCallback(() => {
    console.log('🛑 FORCE STOP: Stopping Lara Assistant immediately...');
    shouldContinueRef.current = false;

    // Set flag to false FIRST before aborting
    setLaraRunning(false);

    // Immediately abort all voice operations (hard stop)
    console.log('🛑 FORCE STOP: Calling abortCurrentRecognition...');
    abortCurrentRecognition();

    // Also cancel speech synthesis directly
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn('⚠️ Error canceling speech synthesis:', error);
      }
    }

    stopLaraAssistant();
    setIsRunning(false);
    console.log('🛑 FORCE STOP: Complete');
  }, []);

  // Restart Lara Assistant
  const restart = useCallback(() => {
    stop();
    setTimeout(() => start(), 500);
  }, [start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        stop();
      }
    };
  }, [isRunning, stop]);

  return {
    isRunning,
    error,
    start,
    stop,
    restart,
  };
}



