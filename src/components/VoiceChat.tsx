"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoiceChatProps {
  userId?: string;
  onClose?: () => void;
}

/**
 * Real-time voice chat component for Lara
 * Supports voice input, speech recognition, and text-to-speech output
 */
export function VoiceChat({ userId, onClose }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice input hook
  const voiceInput = useVoiceInput({
    onRecordingStart: () => console.log("🎤 Recording started"),
    onRecordingStop: () => console.log("⏹️ Recording stopped"),
    onError: (err) => setError(err),
  });

  // Speech recognition hook
  const speechRecognition = useSpeechRecognition({
    onTranscriptionStart: () => console.log("🔄 Transcribing..."),
    onError: (err) => setError(err),
  });

  // Text-to-speech hook
  const textToSpeech = useTextToSpeech({
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: "en-US",
    onStart: () => console.log("🗣️ Speaking..."),
    onEnd: () => console.log("✅ Done speaking"),
    onError: (err) => setError(err),
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle voice input
  const handleVoiceInput = useCallback(async () => {
    try {
      setError(null);

      if (voiceInput.isRecording) {
        // Stop recording
        const audioBlob = await voiceInput.stopRecording();
        if (!audioBlob) return;

        setIsProcessing(true);

        // Transcribe audio
        const transcribedText =
          await speechRecognition.transcribeAudio(audioBlob);
        if (!transcribedText) {
          setError("Failed to transcribe audio");
          return;
        }

        // Add user message
        const userMessage: Message = {
          role: "user",
          content: transcribedText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        const response = await fetch("/api/ai/voice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: transcribedText,
            userId,
            conversationHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get response");
        }

        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Speak response
        textToSpeech.speak(data.message);
      } else {
        // Start recording
        await voiceInput.startRecording();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("❌ Voice input error:", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [voiceInput, speechRecognition, textToSpeech, messages, userId]);

  // Handle text input
  const handleTextInput = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      try {
        setError(null);
        setIsProcessing(true);

        // Add user message
        const userMessage: Message = {
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response
        const response = await fetch("/api/ai/voice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: text,
            userId,
            conversationHistory: messages,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get response");
        }

        // Add assistant message
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Speak response
        textToSpeech.speak(data.message);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("❌ Error:", errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [messages, userId, textToSpeech],
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Voice Chat with Lara</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start speaking to chat with Lara</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mx-4 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="border-t bg-white p-4 rounded-b-lg space-y-3">
        {/* Audio level indicator */}
        {voiceInput.isRecording && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${voiceInput.audioLevel}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {Math.round(voiceInput.audioLevel)}%
            </span>
          </div>
        )}

        {/* Voice input button */}
        <button
          onClick={handleVoiceInput}
          disabled={isProcessing || speechRecognition.isTranscribing}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
            voiceInput.isRecording
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {voiceInput.isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </button>

        {/* Text input */}
        <TextInput onSend={handleTextInput} disabled={isProcessing} />

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex gap-2">
            {speechRecognition.isTranscribing && (
              <span>🔄 Transcribing...</span>
            )}
            {isProcessing && <span>⏳ Processing...</span>}
            {textToSpeech.isSpeaking && <span>🗣️ Speaking...</span>}
          </div>
          <button
            onClick={() =>
              textToSpeech.isSpeaking ? textToSpeech.stop() : null
            }
            className="hover:text-gray-900 transition"
          >
            {textToSpeech.isSpeaking ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Text input component for voice chat
 */
function TextInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or type a message..."
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}
