'use client';

import { useCallback, useEffect, useState } from 'react';
import { useVoskRecognizer } from '@/hooks/useVoskRecognizer';

/**
 * VoskVoiceButton Component
 * Demonstrates Vosk wake-word detection and speech recognition
 * 
 * Features:
 * - Start/stop listening
 * - Wake-word detection ("hey lara")
 * - Real-time speech recognition
 * - Error handling
 * - Loading states
 */

export function VoskVoiceButton() {
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [partialText, setPartialText] = useState('');
  const [feedback, setFeedback] = useState('');

  // Initialize Vosk recognizer
  const { start, stop, isRunning, isLoading, error } = useVoskRecognizer({
    autoStart: false,
    modelPath: '/vosk/model.zip',
    onWakeWord: () => {
      console.log('✅ Wake word detected!');
      setWakeWordDetected(true);
      setFeedback('Wake word detected! Listening for command...');
      
      // Speak feedback
      speakText('Yes, how can I help?');
    },
    onRecognize: (text) => {
      console.log('🎤 Recognized:', text);
      setRecognizedText(text);
      setFeedback(`Recognized: ${text}`);
    },
    onPartialResult: (partial) => {
      console.log('🎤 Partial:', partial);
      setPartialText(partial);
    },
    onError: (err) => {
      console.error('❌ Error:', err);
      setFeedback(`Error: ${err}`);
    },
  });

  // Handle start button
  const handleStart = useCallback(async () => {
    try {
      console.log('🎤 Starting Vosk recognizer...');
      setFeedback('Starting...');
      await start();
      setFeedback('Listening for "Hey Lara"...');
    } catch (err) {
      console.error('Failed to start:', err);
      setFeedback('Failed to start listening');
    }
  }, [start]);

  // Handle stop button
  const handleStop = useCallback(() => {
    console.log('🎤 Stopping Vosk recognizer...');
    stop();
    setFeedback('Stopped');
    setWakeWordDetected(false);
    setRecognizedText('');
    setPartialText('');
  }, [stop]);

  // Speak text using Web Speech API
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-reset wake word detection after 5 seconds
  useEffect(() => {
    if (wakeWordDetected) {
      const timer = setTimeout(() => {
        setWakeWordDetected(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wakeWordDetected]);

  return (
    <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🎤 Vosk Voice Control</h2>
        <p className="text-sm text-slate-400">Say "Hey Lara" to activate</p>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-3">
        <div
          className={`w-4 h-4 rounded-full transition-all ${
            isRunning
              ? 'bg-green-500 animate-pulse'
              : wakeWordDetected
              ? 'bg-blue-500 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span className="text-sm font-medium text-slate-300">
          {isLoading
            ? 'Loading...'
            : isRunning
            ? 'Listening'
            : wakeWordDetected
            ? 'Wake Word Detected'
            : 'Stopped'}
        </span>
      </div>

      {/* Feedback Text */}
      {feedback && (
        <div className="p-3 bg-slate-700 rounded border border-slate-600">
          <p className="text-sm text-slate-200">{feedback}</p>
        </div>
      )}

      {/* Recognized Text */}
      {recognizedText && (
        <div className="p-3 bg-green-900 rounded border border-green-700">
          <p className="text-xs text-slate-400 mb-1">Recognized:</p>
          <p className="text-sm text-green-200 font-medium">{recognizedText}</p>
        </div>
      )}

      {/* Partial Text */}
      {partialText && !recognizedText && (
        <div className="p-3 bg-blue-900 rounded border border-blue-700">
          <p className="text-xs text-slate-400 mb-1">Listening:</p>
          <p className="text-sm text-blue-200 italic">{partialText}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900 rounded border border-red-700">
          <p className="text-xs text-slate-400 mb-1">Error:</p>
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleStart}
          disabled={isRunning || isLoading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium rounded transition-colors"
        >
          {isLoading ? 'Loading...' : 'Start'}
        </button>
        <button
          onClick={handleStop}
          disabled={!isRunning}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-medium rounded transition-colors"
        >
          Stop
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-slate-500 text-center">
        <p>Model: Vosk • Sample Rate: 16000 Hz</p>
        <p>Status: {isRunning ? '✅ Active' : '⏸️ Inactive'}</p>
      </div>
    </div>
  );
}

