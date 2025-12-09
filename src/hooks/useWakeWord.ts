"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseWakeWordOptions {
  wakeWord?: string;
  enabled?: boolean;
  onWakeWordDetected?: () => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseWakeWordReturn {
  isListeningForWakeWord: boolean;
  wakeWordDetected: boolean;
  startWakeWordListener: () => void;
  stopWakeWordListener: () => void;
  restartWakeWordListener: () => void;
  isSupported: boolean;
  error: string | null;
}

// Phonetic variations of "Hey Lara"
const WAKE_WORD_VARIATIONS = [
  "hey lara",
  "hey laura",
  "hey lora",
  "hey larra",
  "hey laira",
  "hey lera",
];

// Helper function to check if transcript contains any wake word variation
function isWakeWordDetected(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase().trim();
  return WAKE_WORD_VARIATIONS.some((variation) =>
    lowerTranscript.includes(variation),
  );
}

// Helper function to get the detected variation for logging
function getDetectedVariation(transcript: string): string {
  const lowerTranscript = transcript.toLowerCase().trim();
  const detected = WAKE_WORD_VARIATIONS.find((variation) =>
    lowerTranscript.includes(variation),
  );
  return detected || "unknown";
}

export function useWakeWord(
  options: UseWakeWordOptions = {},
): UseWakeWordReturn {
  const {
    wakeWord = "hey lara",
    enabled = true,
    onWakeWordDetected,
    onError,
    language = "en-US",
  } = options;

  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef("");
  const enabledRef = useRef(enabled);
  const isMountedRef = useRef(true);
  const isRecognitionRunningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyStoppedRef = useRef(false);
  const pendingRestartRef = useRef(false);
  const callbackRef = useRef(onWakeWordDetected);

  // Sync enabled state to ref for use in event handlers
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Update callback ref whenever it changes
  useEffect(() => {
    callbackRef.current = onWakeWordDetected;
  }, [onWakeWordDetected]);

  // Track component mount status - only set to false on actual unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize speech recognition - use useCallback to memoize the setup
  const setupRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      const errorMsg = "Speech recognition not supported in this browser";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    // Increase timeout to prevent 'no-speech' errors
    // Default is 10 seconds, we increase to 30 seconds
    (recognition as any).maxAlternatives = 1;
    recognition.language = language;

    recognition.onstart = () => {
      if (!isMountedRef.current) return;
      isRecognitionRunningRef.current = true;
      setIsListeningForWakeWord(true);
      setError(null);
      interimTranscriptRef.current = "";
      console.log("🎤 Wake word listener started");
    };

    recognition.onresult = (event: any) => {
      if (!isMountedRef.current) return;

      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Check for wake word in final transcript
          const lowerTranscript = transcript.toLowerCase().trim();
          console.log("🎤 Final transcript:", lowerTranscript);

          // Check if any wake word variation is detected
          if (isWakeWordDetected(lowerTranscript)) {
            const detectedVariation = getDetectedVariation(lowerTranscript);
            console.log("✅ Wake word detected:", detectedVariation);
            setWakeWordDetected(true);
            setIsListeningForWakeWord(false);
            isManuallyStoppedRef.current = true;

            // Stop recognition immediately to prevent further processing
            try {
              recognition.stop();
            } catch (e) {
              console.error("Error stopping recognition:", e);
            }

            // Call the callback via ref to ensure we call the latest version
            if (!isMountedRef.current) return;
            console.log("🎤 Calling onWakeWordDetected callback");
            callbackRef.current?.();

            return;
          }
        } else {
          interimTranscript += transcript;
        }
      }

      interimTranscriptRef.current = interimTranscript;
    };

    recognition.onerror = (event: any) => {
      if (!isMountedRef.current) return;

      // Ignore 'aborted' errors - these are normal when recognition is stopped
      if (event.error === "aborted") {
        return;
      }

      // Handle 'no-speech' error by restarting recognition
      // This is a common timeout error that can be recovered from
      if (event.error === "no-speech") {
        console.log("🎤 No speech detected, restarting recognition...");
        // Restart recognition after a short delay
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          if (
            isMountedRef.current &&
            !isManuallyStoppedRef.current &&
            enabledRef.current
          ) {
            try {
              if (recognitionRef.current && !isRecognitionRunningRef.current) {
                isRecognitionRunningRef.current = true;
                recognitionRef.current.start();
              }
            } catch (e) {
              console.error("Error restarting recognition:", e);
            }
          }
        }, 500);
        return;
      }

      console.error("Wake word recognition error:", event.error);
      let errorMsg = "Speech recognition error";

      switch (event.error) {
        case "audio-capture":
          errorMsg = "No microphone found. Ensure it is connected.";
          break;
        case "network":
          errorMsg = "Network error. Please check your connection.";
          break;
        case "not-allowed":
          errorMsg = "Microphone permission denied.";
          break;
        case "service-not-allowed":
          errorMsg = "Speech recognition service not allowed.";
          break;
      }

      setError(errorMsg);
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      console.log("🎤 Wake word recognition ended");
      isRecognitionRunningRef.current = false;

      if (!isMountedRef.current) {
        console.log("🎤 Component unmounted, not restarting");
        return;
      }

      setIsListeningForWakeWord(false);

      // If manually stopped, don't restart
      if (isManuallyStoppedRef.current) {
        console.log("🎤 Wake word listener stopped intentionally");
        return;
      }

      // If disabled, don't restart
      if (!enabledRef.current) {
        console.log("🎤 Wake word listener disabled");
        return;
      }

      // Only restart if not already pending
      if (!pendingRestartRef.current) {
        console.log("🎤 Scheduling wake word listener restart...");
        pendingRestartRef.current = true;

        // Clear any existing restart timeout
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        // Restart after 500ms to allow state to settle
        restartTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) {
            console.log("🎤 Component unmounted, cancelling restart");
            pendingRestartRef.current = false;
            return;
          }

          if (!enabledRef.current) {
            console.log("🎤 Wake word listener disabled, cancelling restart");
            pendingRestartRef.current = false;
            return;
          }

          if (isManuallyStoppedRef.current) {
            console.log("🎤 Manually stopped, cancelling restart");
            pendingRestartRef.current = false;
            return;
          }

          if (isRecognitionRunningRef.current) {
            console.log("🎤 Recognition already running, skipping restart");
            pendingRestartRef.current = false;
            return;
          }

          try {
            console.log("🎤 Starting wake word recognition again");
            isRecognitionRunningRef.current = true;
            recognition.start();
          } catch (e) {
            isRecognitionRunningRef.current = false;
            pendingRestartRef.current = false;
            if (e instanceof Error && !e.message.includes("already started")) {
              console.error("Error restarting wake word listener:", e);
            }
          }
        }, 500);
      }
    };
  }, [language, wakeWord, onWakeWordDetected, onError]);

  // Initialize recognition on mount
  useEffect(() => {
    setupRecognition();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    };
  }, [setupRecognition]);

  const startWakeWordListener = useCallback(() => {
    if (!recognitionRef.current || !isSupported || !isMountedRef.current)
      return;

    // Don't start if already running
    if (isRecognitionRunningRef.current) {
      console.log("🎤 Recognition already running, skipping start");
      return;
    }

    try {
      console.log("🎤 Starting wake word listener");
      setWakeWordDetected(false);
      isManuallyStoppedRef.current = false;
      setError(null);
      isRecognitionRunningRef.current = true;
      recognitionRef.current.start();
    } catch (e) {
      isRecognitionRunningRef.current = false;
      console.error("Error starting wake word listener:", e);
      const errorMsg = "Failed to start wake word listener";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isSupported, onError]);

  const stopWakeWordListener = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      isManuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListeningForWakeWord(false);
    } catch (e) {
      console.error("Error stopping wake word listener:", e);
    }
  }, []);

  const restartWakeWordListener = useCallback(() => {
    if (!recognitionRef.current || !isSupported || !isMountedRef.current)
      return;

    try {
      console.log("🎤 Explicitly restarting wake word listener");
      isManuallyStoppedRef.current = false;
      pendingRestartRef.current = false;
      setWakeWordDetected(false);
      setError(null);

      // If already running, stop first
      if (isRecognitionRunningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }

      // Start after a brief delay
      setTimeout(() => {
        if (!isMountedRef.current || isRecognitionRunningRef.current) return;
        try {
          isRecognitionRunningRef.current = true;
          recognitionRef.current.start();
        } catch (e) {
          isRecognitionRunningRef.current = false;
          console.error("Error restarting wake word listener:", e);
        }
      }, 100);
    } catch (e) {
      console.error("Error in restartWakeWordListener:", e);
    }
  }, [isSupported]);

  return {
    isListeningForWakeWord,
    wakeWordDetected,
    startWakeWordListener,
    stopWakeWordListener,
    restartWakeWordListener,
    isSupported,
    error,
  };
}
