/**
 * useVoskRecognizer Hook
 * React hook for Vosk wake-word detection and speech recognition
 * 
 * Usage:
 * const { start, stop, isRunning } = useVoskRecognizer({
 *   onWakeWord: () => console.log('Wake word detected!'),
 *   onRecognize: (text) => console.log('Recognized:', text),
 * });
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadVoskModel,
  startRecognizer,
  stopRecognizer,
  getRecognizerState,
  resetRecognizer,
  VoskRecognizerCallbacks,
} from '@/lib/voice/vosk-recognizer';

export interface UseVoskRecognizerOptions extends VoskRecognizerCallbacks {
  autoStart?: boolean;
  modelPath?: string;
}

export interface UseVoskRecognizerReturn {
  start: () => Promise<void>;
  stop: () => void;
  reset: () => Promise<void>;
  isRunning: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useVoskRecognizer(
  options: UseVoskRecognizerOptions = {}
): UseVoskRecognizerReturn {
  const {
    autoStart = false,
    modelPath = '/vosk/model.zip',
    onWakeWord,
    onRecognize,
    onError,
    onPartialResult,
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Start recognizer
  const start = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎤 Starting Vosk recognizer hook...');

      await startRecognizer(
        () => {
          console.log('✅ Wake word detected in hook');
          onWakeWord?.();
        },
        (text) => {
          console.log('🎤 Recognized text in hook:', text);
          onRecognize?.(text);
        },
        (err) => {
          console.error('❌ Error in hook:', err);
          if (isMountedRef.current) {
            setError(err);
          }
          onError?.(err);
        },
        (partial) => {
          console.log('🎤 Partial result in hook:', partial);
          onPartialResult?.(partial);
        }
      );

      if (isMountedRef.current) {
        setIsRunning(true);
        setIsLoading(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to start recognizer:', errorMsg);
      if (isMountedRef.current) {
        setError(errorMsg);
        setIsLoading(false);
      }
      onError?.(errorMsg);
    }
  }, [onWakeWord, onRecognize, onError, onPartialResult]);

  // Stop recognizer
  const stop = useCallback(() => {
    try {
      console.log('🎤 Stopping Vosk recognizer hook...');
      stopRecognizer();
      if (isMountedRef.current) {
        setIsRunning(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to stop recognizer:', errorMsg);
      if (isMountedRef.current) {
        setError(errorMsg);
      }
    }
  }, []);

  // Reset recognizer
  const reset = useCallback(async () => {
    try {
      console.log('🎤 Resetting Vosk recognizer hook...');
      stop();
      await resetRecognizer();
      if (isMountedRef.current) {
        setError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to reset recognizer:', errorMsg);
      if (isMountedRef.current) {
        setError(errorMsg);
      }
    }
  }, [stop]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    start,
    stop,
    reset,
    isRunning,
    isLoading,
    error,
  };
}

