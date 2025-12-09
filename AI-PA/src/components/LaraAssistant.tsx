/**
 * Lara Voice Assistant Component
 *
 * Full voice assistant with wake word detection, command listening,
 * intent parsing, and action execution.
 *
 * Usage:
 * <LaraAssistant userId="user-123" />
 */

"use client";

import { useState, useEffect } from "react";
import { useLara } from "@/hooks/useLara";
import { Mic, MicOff, RotateCcw, AlertCircle } from "lucide-react";

export interface LaraAssistantProps {
  userId: string;
  autoStart?: boolean;
  onError?: (error: Error) => void;
}

export function LaraAssistant({
  userId,
  autoStart = false,
  onError,
}: LaraAssistantProps) {
  const [showStatus, setShowStatus] = useState(true);
  const { isRunning, error, start, stop, restart } = useLara({
    userId,
    onError,
  });

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Indicator */}
      {showStatus && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <h3 className="font-semibold text-gray-900">Lara Assistant</h3>
            </div>
            <button
              onClick={() => setShowStatus(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Status Text */}
          <p className="text-sm text-gray-600 mb-3">
            {isRunning
              ? '🎤 Listening for "Hey Lara"...'
              : "⏸️ Assistant is paused"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={start}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
              >
                <Mic className="w-4 h-4" />
                Start
              </button>
            ) : (
              <button
                onClick={stop}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
              >
                <MicOff className="w-4 h-4" />
                Stop
              </button>
            )}

            <button
              onClick={restart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition"
              title="Restart Lara"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <p className="font-semibold mb-1">How to use:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Say "Hey Lara"</li>
              <li>Wait for "How can I help you?"</li>
              <li>Say your command</li>
              <li>Lara will execute it</li>
            </ol>
          </div>

          {/* Example Commands */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <p className="font-semibold mb-1">Example commands:</p>
            <ul className="space-y-1">
              <li>• "Play a song"</li>
              <li>• "Show my tasks"</li>
              <li>• "Add a reminder"</li>
              <li>• "Go to home page"</li>
            </ul>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!showStatus && (
        <button
          onClick={() => setShowStatus(true)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-110 ${
            isRunning
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
          title="Show Lara status"
        >
          <Mic className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
