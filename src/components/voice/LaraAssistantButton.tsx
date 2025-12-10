"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLaraAssistant } from "@/hooks/useLaraAssistant";
import { type Intent } from "@/lib/ai/intent-classifier";
import { Button } from "@/components/ui/button";
import { ActionResult } from "@/lib/ai/action-router";

interface LaraAssistantButtonProps {
  className?: string;
  userId?: string;
}

/**
 * Lara Assistant Button Component
 * Complete voice automation pipeline with navigation
 * This is a CLIENT component that handles navigation and UI updates
 */
export function LaraAssistantButton({
  className = "",
  userId,
}: LaraAssistantButtonProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<
    "success" | "error" | "info"
  >("info");

  // Handle action execution with navigation
  const handleActionExecuted = useCallback(
    (result: ActionResult) => {
      console.log("✅ Action executed:", result);

      if (result.success) {
        setFeedback(result.message);
        setFeedbackType("success");

        // Handle navigation - this MUST happen in the client component
        if (result.data?.navigationTarget) {
          console.log("🧭 Navigating to:", result.data.navigationTarget);
          // Use setTimeout to ensure state updates are processed first
          setTimeout(() => {
            router.push(result.data.navigationTarget);
          }, 300);
        }
      } else {
        setFeedback(result.message);
        setFeedbackType("error");
      }
    },
    [router],
  );

  const {
    isProcessing,
    currentIntent,
    lastActionResult,
    error,
    isListeningForWakeWord,
    startAssistant,
    stopAssistant,
  } = useLaraAssistant({
    userId,
    onWakeWordDetected: () => {
      console.log("🎤 Wake word detected!");
      setFeedback("Wake word detected! Listening for command...");
      setFeedbackType("info");
    },
    onIntentClassified: (intent: Intent) => {
      console.log("✅ Intent classified:", intent.intent);
      setFeedback(`Intent: ${intent.intent}`);
      setFeedbackType("info");
    },
    onActionExecuted: handleActionExecuted,
    onError: (errorMsg: string) => {
      console.error("❌ Error:", errorMsg);
      setFeedback(`Error: ${errorMsg}`);
      setFeedbackType("error");
    },
  });

  // Auto-start assistant on mount
  useEffect(() => {
    startAssistant();

    return () => {
      stopAssistant();
    };
  }, [startAssistant, stopAssistant]);

  const handleToggle = () => {
    if (isListeningForWakeWord) {
      stopAssistant();
      setFeedback("Assistant stopped");
    } else {
      startAssistant();
      setFeedback('Listening for "Hey Lara"...');
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Main Button */}
      <Button
        onClick={handleToggle}
        size="icon"
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transform transition-all duration-300 ${
          isListeningForWakeWord
            ? "bg-blue-500 hover:bg-blue-600 scale-110 animate-pulse"
            : isProcessing
              ? "bg-yellow-500 hover:bg-yellow-600 scale-110"
              : "bg-primary hover:bg-primary/90 hover:scale-110"
        } text-white`}
        title={
          isProcessing
            ? "Processing..."
            : isListeningForWakeWord
              ? "Stop listening"
              : "Start listening"
        }
      >
        <span className="material-symbols-outlined text-4xl">
          {isProcessing
            ? "hourglass_empty"
            : isListeningForWakeWord
              ? "mic"
              : "mic_none"}
        </span>
      </Button>

      {/* Status Indicator */}
      <div className="text-center">
        <p className="text-sm font-medium">
          {isProcessing
            ? "⏳ Processing..."
            : isListeningForWakeWord
              ? '🎤 Listening for "Hey Lara"'
              : "⏸️ Stopped"}
        </p>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm text-center max-w-xs ${
            feedbackType === "success"
              ? "bg-green-100 text-green-800"
              : feedbackType === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Current Intent Display */}
      {currentIntent && (
        <div className="p-3 rounded-lg bg-purple-100 text-purple-800 text-sm max-w-xs">
          <p className="font-medium">Intent: {currentIntent.intent}</p>
          {currentIntent.taskText && <p>Task: {currentIntent.taskText}</p>}
          {currentIntent.musicQuery && <p>Music: {currentIntent.musicQuery}</p>}
          {currentIntent.query && <p>Query: {currentIntent.query}</p>}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm max-w-xs">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Last Action Result */}
      {lastActionResult && (
        <div
          className={`p-3 rounded-lg text-sm max-w-xs ${
            lastActionResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <p className="font-medium">Action: {lastActionResult.action}</p>
          <p>{lastActionResult.message}</p>
        </div>
      )}
    </div>
  );
}
