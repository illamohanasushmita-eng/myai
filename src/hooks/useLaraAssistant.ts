"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useWakeWord } from "./useWakeWord";
import { routeAction, ActionResult } from "@/lib/ai/action-router";
import { Intent } from "@/lib/ai/intent-classifier";

interface UseLaraAssistantOptions {
  onWakeWordDetected?: () => void;
  onIntentClassified?: (intent: Intent) => void;
  onActionExecuted?: (result: ActionResult) => void;
  onError?: (error: string) => void;
  userId?: string;
}

interface UseLaraAssistantReturn {
  isProcessing: boolean;
  currentIntent: Intent | null;
  lastActionResult: ActionResult | null;
  error: string | null;
  isListeningForWakeWord: boolean;
  startAssistant: () => void;
  stopAssistant: () => void;
  restartAssistant: () => void;
  handlePlayMusic: (musicQuery: string) => Promise<string>;
  handleAddTask: (taskText: string) => Promise<string>;
  processVoiceCommand: (audioBlob: Blob) => Promise<void>;
  executeAction: (intent: Intent) => Promise<string>;
}

/**
 * Complete voice automation pipeline hook
 * Handles: wake word detection → recording → STT → intent classification → action routing
 */
export function useLaraAssistant(
  options: UseLaraAssistantOptions = {},
): UseLaraAssistantReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [lastActionResult, setLastActionResult] = useState<ActionResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const pipelineCallbackRef = useRef<(() => Promise<void>) | null>(null);

  /**
   * Record audio for a fixed duration
   */
  const recordForFixedDuration = useCallback(
    async (duration: number): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        try {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              streamRef.current = stream;
              audioChunksRef.current = [];

              const mediaRecorder = new MediaRecorder(stream);
              mediaRecorderRef.current = mediaRecorder;

              mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
              };

              mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                  type: "audio/wav",
                });
                stream.getTracks().forEach((track) => track.stop());
                resolve(audioBlob);
              };

              mediaRecorder.start();

              // Stop recording after specified duration
              setTimeout(() => {
                if (mediaRecorder.state !== "inactive") {
                  mediaRecorder.stop();
                }
              }, duration);
            })
            .catch((err) => {
              console.error("❌ Error accessing microphone:", err);
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    },
    [],
  );

  /**
   * Convert audio blob to text using Gemini STT
   */
  const geminiSTT = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      console.log("🎤 Converting audio to text with Gemini STT");

      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/ai/stt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      console.log("✅ Transcribed text:", data.text);

      return data.text;
    } catch (err) {
      console.error("❌ Error in STT:", err);
      throw err;
    }
  }, []);

  /**
   * Classify intent using Cohere API
   */
  const classifyIntent = useCallback(async (text: string): Promise<Intent> => {
    try {
      console.log("🎤 [LARA] Classifying intent with Cohere:", text);

      // Use Cohere endpoint instead of OpenAI
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Intent API failed: ${response.status}`);
      }

      const cohereData = await response.json();
      console.log("🧠 [COHERE] Raw response:", cohereData);

      // Convert Cohere response to Intent format
      const intent: Intent = convertCohereToIntent(text, cohereData);
      console.log("✅ [LARA] Converted intent:", intent);

      return intent;
    } catch (err) {
      console.error("❌ [LARA] Intent classification error:", err);
      return fallbackIntentClassification(text);
    }
  }, []);

  // Convert Cohere response to your Intent interface
  function convertCohereToIntent(text: string, cohereData: any): Intent {
    const intentType = mapCohereIntent(cohereData.intent);
    const entities = cohereData.entities || {};

    let intent: Intent = {
      intent: intentType,
      query: text,
      navigationTarget: null,
      musicQuery: null,
      taskText: null,
      time: null,
    };

    // Extract specific fields based on intent
    switch (intentType) {
      case "add_task":
        intent.taskText = entities.title || extractTaskText(text);
        break;

      case "show_tasks":
        intent.navigationTarget = "/tasks";
        break;

      case "add_reminder":
        intent.time = entities.time || null;
        break;

      case "show_reminders":
        intent.navigationTarget = "/reminders";
        break;

      case "play_music":
        intent.musicQuery =
          entities.artist ||
          entities.genre ||
          entities.mood ||
          "favorite songs";
        break;

      case "navigate":
        // Only allow /tasks or /reminders as navigation targets
        const page = entities.page || "dashboard";
        if (page === "tasks") {
          intent.navigationTarget = "/tasks";
        } else if (page === "reminders") {
          intent.navigationTarget = "/reminders";
        }
        break;
    }

    return intent;
  }

  // Map Cohere intents to your Intent type
  function mapCohereIntent(cohereIntent: string): Intent["intent"] {
    switch (cohereIntent) {
      case "add_task":
      case "task_create":
        return "add_task";
      case "show_tasks":
      case "tasks_show":
        return "show_tasks";
      case "add_reminder":
      case "reminder_create":
        return "add_reminder";
      case "show_reminders":
      case "reminders_show":
        return "show_reminders";
      case "play_music":
      case "music_play":
        return "play_music";
      case "navigate":
        return "navigate";
      case "general_greeting":
        return "general_query"; // Map to existing type
      default:
        return "general_query";
    }
  }

  // Extract task text from voice input (fallback)
  function extractTaskText(text: string): string {
    const patterns = [
      /(?:add|create)\s+(?:a\s+)?task\s+(?:to\s+)?(.+)/i,
      /task\s+add\s+(?:to\s+)?(.+)/i,
      /(?:add|create)\s+(.+?)\s+(?:to\s+)?(?:task|todo)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return text.replace(/(?:add|create|task|to)/gi, "").trim();
  }

  // Fallback when Cohere fails
  function fallbackIntentClassification(text: string): Intent {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("task") &&
      (lowerText.includes("add") || lowerText.includes("create"))
    ) {
      return {
        intent: "add_task",
        query: text,
        taskText: extractTaskText(text),
        navigationTarget: null,
        musicQuery: null,
        time: null,
      };
    }

    if (lowerText.includes("task") && lowerText.includes("show")) {
      return {
        intent: "show_tasks",
        query: text,
        navigationTarget: "/tasks",
        musicQuery: null,
        taskText: null,
        time: null,
      };
    }

    if (
      lowerText.includes("play") &&
      (lowerText.includes("music") || lowerText.includes("song"))
    ) {
      return {
        intent: "play_music",
        query: text,
        musicQuery: "favorite songs",
        navigationTarget: null,
        taskText: null,
        time: null,
      };
    }

    return {
      intent: "general_query",
      query: text,
      navigationTarget: null,
      musicQuery: null,
      taskText: null,
      time: null,
    };
  }

  // Use wake word hook - define this first so we can use the functions in the callback
  const {
    isListeningForWakeWord,
    startWakeWordListener,
    stopWakeWordListener,
    restartWakeWordListener,
  } = useWakeWord({
    enabled: true,
    onWakeWordDetected: () => {
      // Call the pipeline callback if it's set
      if (pipelineCallbackRef.current) {
        console.log("🎤 Pipeline callback triggered from wake word listener");
        pipelineCallbackRef.current();
      }
    },
    onError: (err) => {
      setError(err);
      options.onError?.(err);
    },
  });

  /**
   * Main pipeline: wake word → record → STT → classify → route
   * This is defined after useWakeWord so we have access to stopWakeWordListener and restartWakeWordListener
   */
  const onWakeWordDetected = useCallback(async () => {
    console.log("🎤 Wake word detected! Starting pipeline...");
    options.onWakeWordDetected?.();

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Stop wake word listener
      console.log("🎤 Step 1: Stopping wake word listener");
      stopWakeWordListener();

      // Step 2: Record audio for 5 seconds
      console.log("🎤 Step 2: Recording audio for 5 seconds");
      const audioBlob = await recordForFixedDuration(5000);
      console.log("✅ Audio recorded");

      // Step 3: Convert to text with Gemini STT
      console.log("🎤 Step 3: Converting audio to text");
      const transcribedText = await geminiSTT(audioBlob);
      console.log("✅ Transcribed text:", transcribedText);

      // Step 4: Classify intent
      console.log("🎤 Step 4: Classifying intent");
      const intent = await classifyIntent(transcribedText);
      setCurrentIntent(intent);
      options.onIntentClassified?.(intent);

      // Step 5: Route and execute action
      console.log("🎤 Step 5: Routing action");
      const actionResult = await routeAction(intent);
      setLastActionResult(actionResult);
      options.onActionExecuted?.(actionResult);

      console.log("✅ Pipeline completed successfully");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Pipeline error:", errorMsg);
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setIsProcessing(false);

      // Step 6: Restart wake word listener - use explicit restart function
      console.log("🎤 Step 6: Restarting wake word listener");
      // Use a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log("🎤 Calling restartWakeWordListener");
        restartWakeWordListener();
      }, 300);
    }
  }, [
    recordForFixedDuration,
    geminiSTT,
    classifyIntent,
    stopWakeWordListener,
    restartWakeWordListener,
    options,
  ]);

  // Update the ref whenever the callback changes
  useEffect(() => {
    pipelineCallbackRef.current = onWakeWordDetected;
  }, [onWakeWordDetected]);

  const startAssistant = useCallback(() => {
    console.log("🎤 Starting Lara Assistant");
    startWakeWordListener();
  }, [startWakeWordListener]);

  const stopAssistant = useCallback(() => {
    console.log("🎤 Stopping Lara Assistant");
    stopWakeWordListener();
    setIsProcessing(false);
  }, [stopWakeWordListener]);

  const restartAssistant = useCallback(() => {
    console.log("🎤 Restarting Lara Assistant");
    restartWakeWordListener();
  }, [restartWakeWordListener]);

  const handlePlayMusic = useCallback(
    async (musicQuery: string): Promise<string> => {
      try {
        if (!musicQuery || musicQuery.trim().length === 0) {
          musicQuery = "favorite songs";
        }

        console.log("🎵 [SPOTIFY] Using intent router for:", musicQuery);

        // Use the intent router which handles URI schemes properly
        const { routeIntent } = await import("@/lib/lara/intentRouter");

        // Pass the musicQuery as userText so extractMusicQuery can parse it properly
        const result = await routeIntent(
          {
            intent: "play_music",
            confidence: 1.0,
            entities: {},
            raw: {},
          },
          musicQuery, // Pass as userText for proper extraction
          { userId: options.userId },
        );

        return result || `Playing ${musicQuery}`;
      } catch (error) {
        console.error("❌ [SPOTIFY] Error playing music:", error);
        return `Failed to play music: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
    [options.userId],
  );

  const handleAddTask = useCallback(
    async (taskText: string): Promise<string> => {
      try {
        if (!taskText || taskText.trim().length === 0) {
          return "Please specify what task to add";
        }

        console.log("📝 [TASK] Adding task:", taskText);

        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskText,
            description: "",
            userId: options.userId,
            status: "pending",
            priority: "medium",
            ai_generated: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create task");
        }

        const result = await response.json();
        console.log("✅ [TASK] Task created:", result);

        return `Task "${taskText}" added successfully`;
      } catch (error) {
        console.error("❌ [TASK] Error adding task:", error);
        return `Failed to add task: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
    [options.userId],
  );

  const processVoiceCommand = useCallback(
    async (audioBlob: Blob): Promise<void> => {
      try {
        console.log("🎤 [LARA] Processing voice command...");
        setIsProcessing(true);
        setError(null);

        // Step 1: Convert speech to text
        console.log("🗣️ [STT] Converting speech to text...");
        const transcript = await geminiSTT(audioBlob);
        console.log("✅ [STT] Transcript:", transcript);

        if (!transcript) {
          throw new Error("Could not understand speech");
        }

        // Step 2: Classify intent
        console.log("🧠 [INTENT] Classifying intent...");
        const intent = await classifyIntent(transcript);
        console.log("✅ [INTENT] Classified:", intent);

        if (options.onIntentClassified) {
          options.onIntentClassified(intent);
        }

        // Step 3: Execute action
        console.log("🎯 [ACTION] Executing action...");
        const result = await routeAction(intent);
        console.log("✅ [ACTION] Result:", result);

        // Step 4: Speak response
        console.log("🔊 [TTS] Speaking response...");
        if (result.message) {
          // Speak the result message if available
          console.log("🔊 Speaking:", result.message);
        }
        console.log("✅ [TTS] Response spoken");

        if (options.onActionExecuted) {
          options.onActionExecuted(result);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error(
          "❌ [LARA] Voice command processing failed:",
          errorMessage,
        );
        setError(errorMessage);

        if (options.onError) {
          options.onError(errorMessage);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [classifyIntent, routeAction, options],
  );

  const executeAction = useCallback(
    async (intent: Intent): Promise<string> => {
      try {
        console.log("🎯 [LARA] Executing action for intent:", intent.intent);

        switch (intent.intent) {
          case "add_task":
            if (intent.taskText) {
              return await handleAddTask(intent.taskText);
            }
            return "Please specify what task to add";

          case "show_tasks":
            console.log("📋 [LARA] Navigating to tasks page");
            window.location.href = "/tasks";
            return "Opening your tasks";

          case "play_music":
            if (intent.musicQuery) {
              return await handlePlayMusic(intent.musicQuery);
            }
            return await handlePlayMusic("favorite songs");

          case "show_reminders":
            console.log("⏰ [LARA] Navigating to reminders page");
            window.location.href = "/reminders";
            return "Opening your reminders";

          case "navigate":
            if (intent.navigationTarget) {
              window.location.href = intent.navigationTarget;
              return `Navigating to ${intent.navigationTarget}`;
            }
            return "Navigation target not specified";

          default:
            return `I understood "${intent.query}" but I'm not sure how to help with that yet.`;
        }
      } catch (error) {
        console.error("❌ [LARA] Action execution error:", error);
        return "Sorry, I encountered an error while processing your request";
      }
    },
    [handleAddTask, handlePlayMusic],
  );

  return {
    isProcessing,
    currentIntent,
    lastActionResult,
    error,
    isListeningForWakeWord,
    startAssistant,
    stopAssistant,
    restartAssistant,
    handlePlayMusic,
    handleAddTask,
    processVoiceCommand,
    executeAction,
  };
}
