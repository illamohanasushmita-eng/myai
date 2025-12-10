/**
 * Voice Automation Workflow
 * Complete voice-only automation for Lara AI Assistant
 *
 * Features:
 * - Wake word detection
 * - Intent classification
 * - Automatic action execution
 * - Voice response (TTS)
 */

import { z } from "zod";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const VoiceIntentSchema = z.object({
  intent: z.enum([
    "play_music",
    "add_task",
    "show_tasks",
    "add_reminder",
    "show_reminders",
    "navigate",
    "general_query",
  ]),
  query: z.string(),
  navigationTarget: z.string().optional(),
  musicQuery: z.string().optional(),
  taskText: z.string().optional(),
  reminderText: z.string().optional(),
  time: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type VoiceIntent = z.infer<typeof VoiceIntentSchema>;

export interface VoiceAutomationResult {
  success: boolean;
  intent: VoiceIntent;
  action: string;
  response: string;
  error?: string;
}

// ============================================================================
// WAKE WORD DETECTION
// ============================================================================

export function detectWakeWord(
  text: string,
  wakeWord: string = "hey lara",
): boolean {
  const normalizedText = text.toLowerCase().trim();
  const normalizedWakeWord = wakeWord.toLowerCase().trim();
  return normalizedText.includes(normalizedWakeWord);
}

// ============================================================================
// INTENT CLASSIFICATION (Gemini API)
// ============================================================================

export async function classifyIntent(text: string): Promise<VoiceIntent> {
  try {
    const response = await fetch("/api/ai/voice-automation/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Classification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return VoiceIntentSchema.parse(data.intent);
  } catch (error) {
    console.error("Intent classification error:", error);
    throw error;
  }
}

// ============================================================================
// VOICE RESPONSE (TTS)
// ============================================================================

export async function speakResponse(
  text: string,
  language: string = "en-US",
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      (utterance as any).language = language;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) =>
        reject(new Error(`TTS error: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// ACTION EXECUTORS
// ============================================================================

export interface ActionExecutorContext {
  userId: string;
  router?: any; // Next.js router
  onNavigate?: (path: string) => void;
  onPlayMusic?: (query: string) => Promise<void>;
  onAddTask?: (text: string) => Promise<void>;
  onAddReminder?: (text: string, time?: string) => Promise<void>;
}

export async function executeAction(
  intent: VoiceIntent,
  context: ActionExecutorContext,
): Promise<VoiceAutomationResult> {
  try {
    let action = "";
    let response = "";

    switch (intent.intent) {
      case "play_music":
        action = "Playing music";
        response = `Playing ${intent.musicQuery || "your favorite songs"} now.`;
        if (context.onPlayMusic) {
          await context.onPlayMusic(intent.musicQuery || "favorite songs");
        }
        break;

      case "add_task":
        action = "Adding task";
        response = `Task "${intent.taskText}" added to your list.`;
        if (context.onAddTask) {
          await context.onAddTask(intent.taskText || "");
        }
        break;

      case "show_tasks":
        action = "Showing tasks";
        response = "Opening your task list.";
        if (context.onNavigate) {
          context.onNavigate("/professional");
        } else if (context.router) {
          context.router.push("/professional");
        }
        break;

      case "add_reminder":
        action = "Adding reminder";
        response = `Reminder "${intent.reminderText}" set${intent.time ? ` for ${intent.time}` : ""}.`;
        if (context.onAddReminder) {
          await context.onAddReminder(intent.reminderText || "", intent.time);
        }
        break;

      case "show_reminders":
        action = "Showing reminders";
        response = "Opening your reminders.";
        if (context.onNavigate) {
          context.onNavigate("/reminders");
        } else if (context.router) {
          context.router.push("/reminders");
        }
        break;

      case "navigate":
        action = "Navigating";
        response = `Going to ${intent.navigationTarget || "the requested page"}.`;
        if (context.onNavigate) {
          context.onNavigate(`/${intent.navigationTarget}`);
        } else if (context.router) {
          context.router.push(`/${intent.navigationTarget}`);
        }
        break;

      case "general_query":
        action = "Processing query";
        response = intent.query;
        break;

      default:
        throw new Error(`Unknown intent: ${intent.intent}`);
    }

    return {
      success: true,
      intent,
      action,
      response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      intent,
      action: "Error",
      response: "Sorry, I encountered an error processing your request.",
      error: errorMessage,
    };
  }
}

// ============================================================================
// UNIFIED VOICE AUTOMATION WORKFLOW
// ============================================================================

export async function voiceAutomation(
  text: string,
  userId: string,
  context: ActionExecutorContext,
): Promise<VoiceAutomationResult> {
  try {
    // Step 1: Detect wake word
    const hasWakeWord = detectWakeWord(text);
    if (!hasWakeWord) {
      return {
        success: false,
        intent: {
          intent: "general_query",
          query: text,
          confidence: 0,
        },
        action: "Wake word not detected",
        response: 'Please start with "Hey Lara".',
      };
    }

    // Step 2: Extract command (remove wake word)
    const command = text.replace(/hey\s+lara\s*/i, "").trim();
    if (!command) {
      return {
        success: false,
        intent: {
          intent: "general_query",
          query: text,
          confidence: 0,
        },
        action: "No command detected",
        response: 'Please say a command after "Hey Lara".',
      };
    }

    // Step 3: Classify intent
    const intent = await classifyIntent(command);

    // Step 4: Execute action
    const result = await executeAction(intent, context);

    // Step 5: Speak response
    if (result.success) {
      await speakResponse(result.response);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Voice automation error:", error);

    return {
      success: false,
      intent: {
        intent: "general_query",
        query: text,
        confidence: 0,
      },
      action: "Error",
      response: "Sorry, I encountered an error. Please try again.",
      error: errorMessage,
    };
  }
}

// ============================================================================
// CONTINUOUS LISTENING MANAGER
// ============================================================================

export class ContinuousListeningManager {
  private isListening = false;
  private recognition: any;
  private userId: string;
  private context: ActionExecutorContext;

  constructor(userId: string, context: ActionExecutorContext) {
    this.userId = userId;
    this.context = context;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error("Speech Recognition not supported");
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.language = "en-US";
  }

  async start(): Promise<void> {
    if (this.isListening) return;

    this.isListening = true;
    this.recognition.onresult = async (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (event.results[event.results.length - 1].isFinal) {
        await voiceAutomation(transcript, this.userId, this.context);
      }
    };

    this.recognition.start();
  }

  stop(): void {
    if (!this.isListening) return;
    this.isListening = false;
    this.recognition.stop();
  }
}
