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
  LaraContext,
} from '@/lib/voice/lara-assistant';
import { automateSpotifyPlayback } from '@/lib/voice/spotify-automation';
import { addTaskVoice } from '@/lib/voice/task-automation';
import { addReminderVoice } from '@/lib/voice/reminder-automation';

export interface UseLaraOptions {
  userId: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UseLaraReturn {
  isRunning: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  restart: () => void;
}

export function useLara(options: UseLaraOptions): UseLaraReturn {
  const { userId, enabled = true, onError } = options;
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

        // Use setTimeout to ensure navigation happens on next tick
        // This helps avoid timing issues with the async assistant loop
        setTimeout(() => {
          try {
            console.log('🔧 Executing router.push for path:', path);
            router.push(path);
            console.log('🔧 router.push completed');
          } catch (error) {
            console.error('🔧 Error during router.push:', error);
          }
        }, 0);
      },
      onPlayMusic: async (query: string) => {
        await automateSpotifyPlayback(query, userId);
      },
      onAddTask: async (text: string) => {
        await addTaskVoice(text, userId, context.onNavigate);
      },
      onAddReminder: async (text: string, time?: string) => {
        await addReminderVoice(text, userId, time, context.onNavigate);
      },
    };
    console.log('🔧 Context created:', {
      hasOnNavigate: !!context.onNavigate,
      hasRouter: !!context.router,
      userId: context.userId
    });
    return context;
  }, [userId, router]);

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
      assistantLoopRef.current.catch((err) => {
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
    shouldContinueRef.current = false;
    setLaraRunning(false);
    stopLaraAssistant();
    setIsRunning(false);
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

