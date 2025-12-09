'use client';

import { useCallback, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscriptionStart?: () => void;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isTranscribing: boolean;
  transcribedText: string | null;
  transcribeAudio: (audioBlob: Blob) => Promise<string | null>;
}

/**
 * Hook for speech-to-text using OpenAI Whisper API
 * Converts audio blobs to text
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);

  const transcribeAudio = useCallback(
    async (audioBlob: Blob): Promise<string | null> => {
      try {
        setIsTranscribing(true);
        options.onTranscriptionStart?.();

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        // Call our API endpoint
        const response = await fetch('/api/ai/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Transcription failed');
        }

        const text = data.text;
        setTranscribedText(text);
        options.onTranscriptionComplete?.(text);

        console.log('✅ Transcribed:', text);
        return text;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transcription error';
        console.error('❌ Transcription error:', errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setIsTranscribing(false);
      }
    },
    [options]
  );

  return {
    isTranscribing,
    transcribedText,
    transcribeAudio,
  };
}

