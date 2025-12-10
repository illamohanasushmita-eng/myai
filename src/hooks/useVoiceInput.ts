"use client";

import { useCallback, useRef, useState } from "react";

interface UseVoiceInputOptions {
  onAudioData?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  audioLevel: number;
}

/**
 * Hook for real-time voice input capture
 * Uses Web Audio API for audio recording
 */
export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const isSupported =
    typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 255) * 100));

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      if (!isSupported) {
        throw new Error("Web Audio API not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio context for level monitoring
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      options.onRecordingStart?.();

      // Start monitoring audio level
      updateAudioLevel();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start recording";
      console.error("❌ Recording error:", errorMessage);
      options.onError?.(errorMessage);
    }
  }, [isSupported, options, updateAudioLevel]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Cleanup
        streamRef.current?.getTracks().forEach((track) => track.stop());
        audioContextRef.current?.close();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        setIsRecording(false);
        setAudioLevel(0);
        options.onRecordingStop?.();
        options.onAudioData?.(audioBlob);

        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, [isRecording, options]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsRecording(false);
      setAudioLevel(0);
    }
  }, [isRecording]);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    audioLevel,
  };
}
