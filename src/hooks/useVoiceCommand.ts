"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  processVoiceCommand,
  getErrorMessage,
  VoiceCommandResponse,
  VoiceCommandError,
} from "@/lib/ai/voice-command";

interface UseVoiceCommandOptions {
  onSuccess?: (response: VoiceCommandResponse) => void;
  onError?: (error: VoiceCommandError) => void;
  language?: string;
  autoStartOnWakeWord?: boolean;
  userId?: string;
}

interface UseVoiceCommandReturn {
  isListening: boolean;
  isProcessing: boolean;
  transcribedText: string;
  lastResponse: VoiceCommandResponse | null;
  error: VoiceCommandError | null;
  startListening: () => void;
  stopListening: () => void;
  resetState: () => void;
  isSupported: boolean;
  activateFromWakeWord: () => void;
}

export function useVoiceCommand(
  options: UseVoiceCommandOptions = {},
): UseVoiceCommandReturn {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [lastResponse, setLastResponse] = useState<VoiceCommandResponse | null>(
    null,
  );
  const [error, setError] = useState<VoiceCommandError | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = options.language || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscribedText("");
      finalTranscriptRef.current = "";
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscribedText(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      const errorCode = event.error.toUpperCase();
      const errorInfo = getErrorMessage(errorCode);
      setError(errorInfo);
      options.onError?.(errorInfo);
    };

    recognition.onend = async () => {
      setIsListening(false);

      if (finalTranscriptRef.current.trim()) {
        setIsProcessing(true);
        try {
          const response = await processVoiceCommand(
            finalTranscriptRef.current.trim(),
            options.userId,
          );
          setLastResponse(response);
          options.onSuccess?.(response);
        } catch (err) {
          const errorInfo = getErrorMessage("GEMINI_ERROR");
          setError(errorInfo);
          options.onError?.(errorInfo);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [options]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("Error stopping speech recognition:", err);
    }
  }, []);

  const resetState = useCallback(() => {
    setTranscribedText("");
    setLastResponse(null);
    setError(null);
    finalTranscriptRef.current = "";
  }, []);

  const activateFromWakeWord = useCallback(() => {
    // Automatically start listening when wake word is detected
    resetState();
    startListening();
  }, [startListening, resetState]);

  return {
    isListening,
    isProcessing,
    transcribedText,
    lastResponse,
    error,
    startListening,
    stopListening,
    resetState,
    isSupported,
    activateFromWakeWord,
  };
}
