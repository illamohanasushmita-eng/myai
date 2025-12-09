'use client';

import { useState } from 'react';
import { VoiceChat } from '@/components/VoiceChat';
import { Mic, MessageSquare, Settings } from 'lucide-react';

/**
 * Test page for voice chat feature
 * Demonstrates real-time voice input and speech output
 */
export default function TestVoiceChatPage() {
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [userId] = useState('test-user-' + Math.random().toString(36).substr(2, 9));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Voice Chat Test</h1>
            </div>
            <div className="text-sm text-gray-600">
              User ID: <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Mic className="w-6 h-6" />}
                title="Voice Input"
                description="Record your voice and get real-time transcription using OpenAI Whisper"
              />
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="AI Response"
                description="Get intelligent responses from Lara powered by GPT-4 Turbo"
              />
              <FeatureCard
                icon={<Settings className="w-6 h-6" />}
                title="Text-to-Speech"
                description="Hear Lara's responses with natural-sounding speech synthesis"
              />
              <FeatureCard
                icon={<Mic className="w-6 h-6" />}
                title="Conversation History"
                description="Maintain context across multiple voice exchanges"
              />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <span>Click "Open Voice Chat" button to start</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <span>Click "Start Recording" and speak clearly</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <span>Your speech will be transcribed automatically</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </span>
                  <span>Lara will respond with text and speech</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </span>
                  <span>Continue the conversation or type messages</span>
                </li>
              </ol>
            </div>

            {/* Example Commands */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Try These Commands</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CommandChip text="Hello Lara" />
                <CommandChip text="Show my tasks" />
                <CommandChip text="What's the weather?" />
                <CommandChip text="Play some music" />
                <CommandChip text="Set a reminder" />
                <CommandChip text="Tell me a joke" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Chat Button */}
            <button
              onClick={() => setShowVoiceChat(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Open Voice Chat
            </button>

            {/* Info Cards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Browser Support</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Chrome/Chromium</li>
                <li>✅ Firefox</li>
                <li>✅ Safari</li>
                <li>✅ Edge</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🎤 Microphone access</li>
                <li>🔊 Speaker/headphones</li>
                <li>🌐 Internet connection</li>
                <li>🔑 OpenAI API key</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
              <p className="text-sm text-blue-800">
                For best results, speak clearly and wait for the transcription to complete before speaking again.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px]">
            <VoiceChat userId={userId} onClose={() => setShowVoiceChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Feature card component
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Command chip component
 */
function CommandChip({ text }: { text: string }) {
  return (
    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-2 rounded-full transition">
      {text}
    </button>
  );
}

