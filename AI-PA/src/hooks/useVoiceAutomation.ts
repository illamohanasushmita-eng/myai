/**
 * useVoiceAutomation Hook
 * Complete voice automation workflow for Lara AI Assistant
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  voiceAutomation,
  VoiceAutomationResult,
  speakResponse,
  ActionExecutorContext,
} from '@/lib/voice/voice-automation';
import { automateSpotifyPlayback } from '@/lib/voice/spotify-automation';
import { addTaskVoice, getTaskSummaryVoice } from '@/lib/voice/task-automation';
import { addReminderVoice, getReminderSummaryVoice } from '@/lib/voice/reminder-automation';
import { navigateVoice } from '@/lib/voice/navigation-automation';

export interface UseVoiceAutomationOptions {
  userId: string;
  enabled?: boolean;
  onSuccess?: (result: VoiceAutomationResult) => void;
  onError?: (error: Error) => void;
  language?: string;
}

export interface UseVoiceAutomationReturn {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  lastResult: VoiceAutomationResult | null;
  error: Error | null;
  startListening: () => void;
  stopListening: () => void;
  resetState: () => void;
  isSupported: boolean;
}

export function useVoiceAutomation(
  options: UseVoiceAutomationOptions
): UseVoiceAutomationReturn {
  const {
    userId,
    enabled = true,
    onSuccess,
    onError,
    language = 'en-US',
  } = options;

  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const finalTranscriptRef = useRef<string>('');

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState<VoiceAutomationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      const err = new Error('Speech Recognition not supported');
      setError(err);
      onError?.(err);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      transcriptRef.current = '';
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscriptRef.current);
    };

    recognition.onend = async () => {
      setIsListening(false);

      if (finalTranscriptRef.current.trim()) {
        setIsProcessing(true);

        try {
          // Create action executor context
          const context: ActionExecutorContext = {
            userId,
            router,
            onNavigate: (path: string) => router.push(path),
            onPlayMusic: async (query: string) => {
              await automateSpotifyPlayback(query, userId);
            },
            onAddTask: async (text: string) => {
              await addTaskVoice(text, userId);
            },
            onAddReminder: async (text: string, time?: string) => {
              await addReminderVoice(text, userId, time);
            },
          };

          // Execute voice automation
          const result = await voiceAutomation(
            finalTranscriptRef.current.trim(),
            userId,
            context
          );

          setLastResult(result);
          onSuccess?.(result);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          onError?.(error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        const err = new Error(`Speech recognition error: ${event.error}`);
        setError(err);
        onError?.(err);
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, [enabled, userId, router, onSuccess, onError, language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported || isListening) return;

    try {
      setError(null);
      setTranscript('');
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start listening');
      setError(error);
      onError?.(error);
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [isListening]);

  const resetState = useCallback(() => {
    setTranscript('');
    setLastResult(null);
    setError(null);
    finalTranscriptRef.current = '';
    transcriptRef.current = '';
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    lastResult,
    error,
    startListening,
    stopListening,
    resetState,
    isSupported,
  };
}

