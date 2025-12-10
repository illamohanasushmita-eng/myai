"use client";

import { useState } from "react";
import { VoiceActivatedMusic } from "@/components/voice/VoiceActivatedMusic";

export default function TestVoicePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const userId = "test-user-123";

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Test browser support
  const testBrowserSupport = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    addLog(`Speech Recognition supported: ${!!SpeechRecognition}`);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => addLog("✅ Microphone access granted"))
      .catch((err) => addLog(`❌ Microphone access denied: ${err.message}`));
  };

  // Test API endpoint
  const testAPI = async () => {
    try {
      const response = await fetch("/api/ai/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "play romantic Telugu songs",
          userId: userId,
        }),
      });
      const result = await response.json();
      addLog(`API Response: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`API Error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Voice Command Test Page</h1>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={testBrowserSupport}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Test Browser Support
        </button>

        <button
          onClick={testAPI}
          className="bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          Test API Endpoint
        </button>
      </div>

      {/* Voice Component */}
      <div className="mb-8">
        <VoiceActivatedMusic userId={userId} />
      </div>

      {/* Debug Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <h3 className="text-white mb-2">Debug Logs:</h3>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
