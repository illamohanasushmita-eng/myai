'use client';

import { useState, useEffect } from 'react';
import { useWakeWord } from '@/hooks/useWakeWord';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';

interface VoiceActivatedMusicProps {
  userId: string;
}

export function VoiceActivatedMusic({ userId }: VoiceActivatedMusicProps) {
  const [status, setStatus] = useState('Ready');
  const [lastCommand, setLastCommand] = useState('');

  // Wake word detection
  const {
    isListeningForWakeWord,
    startWakeWordListener,
    stopWakeWordListener,
    isSupported: wakeWordSupported,
  } = useWakeWord({
    enabled: true,
    onWakeWordDetected: () => {
      console.log('🎤 Wake word detected!');
      setStatus('Wake word detected! Listening for command...');
      stopWakeWordListener();
      startVoiceCommand();
    },
    onError: (error) => {
      console.error('Wake word error:', error);
      setStatus(`Wake word error: ${error}`);
    },
  });

  // Voice command processing
  const {
    startListening: startVoiceCommand,
    stopListening: stopVoiceCommand,
    isListening,
    transcribedText,
    lastResponse,
  } = useVoiceCommand({
    userId,
    onSuccess: (response) => {
      console.log('✅ Command processed:', response);
      setStatus(`Executed: ${response.intent.action}`);
      setLastCommand(response.transcribedText || '');

      // Restart wake word listener after command
      setTimeout(() => {
        startWakeWordListener();
        setStatus('Listening for "Hey Lara"...');
      }, 2000);
    },
    onError: (error) => {
      console.error('Voice command error:', error);
      setStatus(`Command error: ${error.message}`);
      
      // Restart wake word listener on error
      setTimeout(() => {
        startWakeWordListener();
        setStatus('Listening for "Hey Lara"...');
      }, 2000);
    },
  });

  // Auto-start wake word listener
  useEffect(() => {
    if (wakeWordSupported && !isListeningForWakeWord && !isListening) {
      startWakeWordListener();
      setStatus('Listening for "Hey Lara"...');
    }
  }, [wakeWordSupported]);

  if (!wakeWordSupported) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        ❌ Speech recognition not supported in this browser
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">🎤 Voice-Activated Music</h3>
      
      {/* Status Indicator */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          isListeningForWakeWord 
            ? 'bg-blue-100 text-blue-800' 
            : isListening 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isListeningForWakeWord && '🔵 Listening for wake word'}
          {isListening && '🟢 Listening for command'}
          {!isListeningForWakeWord && !isListening && '⚪ Inactive'}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Status:</p>
        <p className="font-medium">{status}</p>
      </div>

      {/* Current Transcript */}
      {transcribedText && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Current transcript:</p>
          <p className="font-medium text-blue-600">"{transcribedText}"</p>
        </div>
      )}

      {/* Last Command */}
      {lastCommand && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Last command:</p>
          <p className="font-medium text-green-600">"{lastCommand}"</p>
        </div>
      )}

      {/* Manual Controls */}
      <div className="flex gap-2">
        <button
          onClick={startWakeWordListener}
          disabled={isListeningForWakeWord}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Start Wake Word
        </button>
        
        <button
          onClick={stopWakeWordListener}
          disabled={!isListeningForWakeWord}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 text-sm text-gray-500">
        <p><strong>Usage:</strong></p>
        <p>1. Say "Hey Lara" to activate</p>
        <p>2. Say commands like "play romantic songs" or "play hero songs"</p>
        <p>3. System will automatically search and play music</p>
      </div>
    </div>
  );
}