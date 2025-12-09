'use client';

import { useCallback, useRef, useState } from 'react';

interface UseTextToSpeechOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  lang?: string; // e.g., 'en-US'
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

/**
 * Hook for text-to-speech using Web Speech API
 * Provides real-time voice output for Lara responses
 */
export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    (!!window.speechSynthesis || !!(window as any).webkitSpeechSynthesis);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.warn('⚠️ Speech Synthesis not supported');
        options.onError?.('Speech Synthesis not supported');
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure speech parameters
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      utterance.lang = options.lang ?? 'en-US';

      // Setup event handlers
      utterance.onstart = () => {
        console.log('🗣️ Lara is speaking...');
        setIsSpeaking(true);
        options.onStart?.();
      };

      utterance.onend = () => {
        console.log('✅ Lara finished speaking');
        setIsSpeaking(false);
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        setIsSpeaking(false);
        options.onError?.(event.error);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, options]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    cancel,
  };
}

