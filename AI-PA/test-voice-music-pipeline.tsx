'use client';

import { useState } from 'react';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { processVoiceCommand } from '@/lib/ai/voice-command';

export default function TestVoiceMusicPipeline() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const userId = 'test-user-123'; // Replace with actual user ID
  
  const { searchTracks, playTrack } = useSpotifyPlayer();
  
  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test 1: Manual Intent Detection
  const testIntentDetection = async () => {
    try {
      addResult('🧠 Testing intent detection...');
      const result = await processVoiceCommand('play romantic Telugu songs', userId);
      addResult(`Intent result: ${JSON.stringify(result)}`);
    } catch (error) {
      addResult(`❌ Intent detection failed: ${error}`);
    }
  };

  // Test 2: Spotify Search
  const testSpotifySearch = async () => {
    try {
      addResult('🔍 Testing Spotify search...');
      const tracks = await searchTracks('romantic Telugu songs', userId);
      addResult(`Found ${tracks.length} tracks`);
      if (tracks.length > 0) {
        addResult(`First track: ${tracks[0].name} by ${tracks[0].artist}`);
      }
    } catch (error) {
      addResult(`❌ Spotify search failed: ${error}`);
    }
  };

  // Test 3: Voice Command Processing
  const {
    startListening,
    stopListening,
    isListening,
    transcribedText,
    isProcessing
  } = useVoiceCommand({
    userId,
    onSuccess: (response) => {
      addResult(`✅ Command processed: ${response.intent.action}`);
    },
    onError: (error) => {
      addResult(`❌ Voice command error: ${error.message}`);
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Voice-to-Music Pipeline Test</h1>
      
      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={testIntentDetection}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Intent Detection
        </button>
        
        <button 
          onClick={testSpotifySearch}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Spotify Search
        </button>
        
        <button 
          onClick={startListening}
          disabled={isListening}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isListening ? 'Listening...' : 'Start Voice Test'}
        </button>
        
        <button 
          onClick={stopListening}
          disabled={!isListening}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Stop Voice Test
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p><strong>Listening:</strong> {isListening ? '🎤 Yes' : '❌ No'}</p>
        <p><strong>Processing:</strong> {isProcessing ? '⏳ Yes' : '✅ No'}</p>
        <p><strong>Transcript:</strong> {transcribedText || 'None'}</p>
      </div>

      {/* Test Results */}
      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        <h3 className="text-white mb-2">Test Results:</h3>
        {testResults.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
    </div>
  );
}