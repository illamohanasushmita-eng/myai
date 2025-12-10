"use client";

import { useState, useEffect } from "react";
import { LaraAssistant } from "@/components/LaraAssistant";
import {
  Mic,
  Music,
  CheckSquare,
  Bell,
  Home,
  Briefcase,
  Sprout,
} from "lucide-react";

/**
 * Test page for Lara Voice Assistant
 * Demonstrates the complete voice automation flow
 */
export default function TestLaraPage() {
  const [userId, setUserId] = useState("test-user-default");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Generate userId only on client side to avoid hydration mismatch
    setUserId("test-user-" + Math.random().toString(36).substr(2, 9));
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Lara Voice Assistant
              </h1>
            </div>
            {isClient && (
              <div className="text-sm text-gray-600">
                User ID:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                🎤 Complete Voice Assistant
              </h2>
              <p className="text-gray-700 mb-4">
                Lara is a full-featured voice assistant that understands your
                commands and performs actions automatically. Just say "Hey Lara"
                to get started!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-900">
                  <strong>How it works:</strong> Say "Hey Lara" → Lara responds
                  "How can I help you?" → Say your command → Lara executes it
                  and confirms.
                </p>
              </div>
            </div>

            {/* Supported Intents */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Supported Intents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Media */}
                <div className="border border-gray-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Media</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• "Play a song"</li>
                    <li>• "Play Telugu song"</li>
                    <li>• "Play my favorite song"</li>
                    <li>• "Play [song/artist]"</li>
                  </ul>
                </div>

                {/* Tasks */}
                <div className="border border-gray-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Tasks</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• "Show my tasks"</li>
                    <li>• "Add a task"</li>
                    <li>• "Open tasks page"</li>
                  </ul>
                </div>

                {/* Reminders */}
                <div className="border border-gray-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Reminders</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• "Show my reminders"</li>
                    <li>• "Add a reminder"</li>
                  </ul>
                </div>

                {/* Navigation */}
                <div className="border border-gray-200 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Navigation</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• "Go to home page"</li>
                    <li>• "Open professional page"</li>
                    <li>• "Open personal growth page"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🚀 How to Use
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <span className="text-gray-700">
                    <strong>Start Lara:</strong> Click the "Start" button in the
                    status panel
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <span className="text-gray-700">
                    <strong>Say "Hey Lara":</strong> Speak clearly into your
                    microphone
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <span className="text-gray-700">
                    <strong>Wait for response:</strong> Lara will say "How can I
                    help you?"
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </span>
                  <span className="text-gray-700">
                    <strong>Say your command:</strong> E.g., "Play a song" or
                    "Show my tasks"
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </span>
                  <span className="text-gray-700">
                    <strong>Lara executes:</strong> The action is performed and
                    confirmed
                  </span>
                </li>
              </ol>
            </div>

            {/* Architecture */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🏗️ Architecture
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>1. Wake Word Detection:</strong> Listens for "Hey
                  Lara"
                </p>
                <p>
                  <strong>2. Command Listening:</strong> Records user's voice
                  command
                </p>
                <p>
                  <strong>3. Intent Parsing:</strong> Uses OpenAI to understand
                  the command
                </p>
                <p>
                  <strong>4. Action Execution:</strong> Performs the requested
                  action
                </p>
                <p>
                  <strong>5. Voice Confirmation:</strong> Speaks a confirmation
                  message
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Status</h3>
              <LaraAssistant userId={userId} />
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                ✅ Requirements
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🎤 Microphone access</li>
                <li>🔊 Speaker/headphones</li>
                <li>🌐 Internet connection</li>
                <li>🔑 OpenAI API key</li>
                <li>🎵 Spotify account (for music)</li>
              </ul>
            </div>

            {/* Browser Support */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                🌐 Browser Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Chrome/Chromium</li>
                <li>✅ Firefox</li>
                <li>✅ Safari</li>
                <li>✅ Edge</li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Speak clearly and naturally</li>
                <li>• Wait for Lara to finish speaking</li>
                <li>• Use specific commands</li>
                <li>• Check browser permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
