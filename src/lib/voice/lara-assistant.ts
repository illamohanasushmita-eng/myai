/**
 * LARA VOICE ASSISTANT - Complete Implementation
 *
 * Flow:
 * 1. User says: "Hey Lara"
 * 2. App speaks: "How can I help you?"
 * 3. App starts listening for command
 * 4. App identifies intent using Wit.ai
 * 5. App performs associated action
 * 6. App speaks confirmation
 */

import { routeIntent, WitIntentResult } from "@/lib/lara/intentRouter";

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedIntent {
  intent: string;
  pageName?: string;
  songName?: string;
  artistName?: string;
}

export interface LaraContext {
  userId: string;
  router?: any;
  onNavigate?: (path: string) => void;
  onPlayMusic?: (query: string) => Promise<void>;
  onAddTask?: (text: string) => Promise<void>;
  onAddReminder?: (text: string, time?: string) => Promise<void>;
  onTaskStatusChange?: (
    status: "processing" | "completed" | "error",
    message?: string,
  ) => void;
  onListeningStateChange?: (
    state: "wake-word" | "command" | "processing" | "idle",
  ) => void;
  oneShot?: boolean; // If true, stop after one command
}

// ============================================================================
// 1. WAKE WORD LISTENER
// ============================================================================

export async function wakeWordListener(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Check if we should stop
    if (shouldStop()) {
      reject(new Error("Assistant stopped"));
      return;
    }

    // Check microphone permission and browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error("Your browser does not support audio recording."));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Close the stream immediately after permission check
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Microphone access error:", err);
      reject(
        new Error(
          "Microphone permission denied. Please allow microphone access in your browser.",
        ),
      );
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    currentRecognition = recognition; // Track this instance
    recognition.continuous = true; // Keep listening for wake word continuously
    recognition.interimResults = true; // Get interim results to detect speech
    recognition.lang = "en-US";

    let wakeWordDetected = false;
    let timeoutId: NodeJS.Timeout | null = null;
    let recognitionStarted = false;
    let startAttempts = 0;
    const maxStartAttempts = 3;

    // Set timeout for wake word detection (30 seconds total)
    timeoutId = setTimeout(() => {
      if (!wakeWordDetected && !shouldStop()) {
        console.warn("⚠️ Wake word detection timeout (30s)");
        recognition.abort();
        reject(
          new Error(
            'Wake word detection timeout. Please say "Hey Lara" to start.',
          ),
        );
      }
    }, 30000);

    recognition.onstart = () => {
      recognitionStarted = true;
      startAttempts = 0; // Reset attempts on successful start
      console.log('👂 Listening for wake word "Hey Lara"...');
    };

    recognition.onresult = (event: any) => {
      // Check if we should stop
      if (shouldStop()) {
        recognition.abort();
        reject(new Error("Assistant stopped"));
        return;
      }

      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (transcript.trim()) {
        console.log("🎤 Detected speech:", transcript);

        // Check if wake word is detected
        // Remove punctuation and extra spaces for better matching
        const cleanTranscript = transcript
          .toLowerCase()
          .replace(/[.,!?;:]/g, "") // Remove punctuation
          .trim();

        // Check for wake word variations: "hey lara", "hey laura", "hey lera", "hey lawra", "hey lora", "hey laraw"
        const wakeWordPatterns = [
          "hey lara",
          "hey laura",
          "hey lera",
          "hey lawra",
          "hey lora",
          "hey laraw",
          "lara",
          "laura",
          "lera",
          "lawra",
          "lora",
          "laraw",
        ];

        const isWakeWordDetected = wakeWordPatterns.some((pattern) =>
          cleanTranscript.includes(pattern),
        );

        if (isWakeWordDetected) {
          console.log("✅ Wake word detected!");
          wakeWordDetected = true;
          if (timeoutId) clearTimeout(timeoutId);
          recognition.abort();
          resolve();
        }
      }
    };

    recognition.onerror = (event: any) => {
      // Check if we're stopping
      if (shouldStop()) {
        console.log("🛑 Error handler - stop signal detected");
        if (timeoutId) clearTimeout(timeoutId);
        recognition.abort();
        reject(new Error("Assistant stopped"));
        return;
      }

      // Handle specific error types
      if (event.error === "no-speech") {
        console.warn("⚠️ No speech detected. Waiting for speech...");
        // In continuous mode, no-speech errors are normal - just keep listening
        return;
      } else if (event.error === "network") {
        console.warn(
          "⚠️ Network error during wake word detection - retrying...",
        );
        // Network errors are often temporary, so we'll retry instead of rejecting
        return;
      } else if (event.error === "audio-capture") {
        console.error("❌ No microphone found");
        if (timeoutId) clearTimeout(timeoutId);
        recognition.abort();
        reject(
          new Error(
            "Microphone not found. Please check your microphone connection.",
          ),
        );
      } else if (event.error === "not-allowed") {
        console.error("❌ Microphone permission denied");
        if (timeoutId) clearTimeout(timeoutId);
        recognition.abort();
        reject(
          new Error(
            "Microphone permission denied. Please allow microphone access.",
          ),
        );
      } else if (event.error === "aborted") {
        // This is expected when we abort after detecting wake word
        console.log("🛑 Recognition aborted");
        if (wakeWordDetected) {
          // If we already detected the wake word, don't reject
          return;
        }
        return;
      } else {
        console.error("❌ Wake word detection error:", event.error);
        if (timeoutId) clearTimeout(timeoutId);
        recognition.abort();
        reject(new Error(`Wake word detection error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      // If we're stopping, don't restart
      if (shouldStop()) {
        console.log("🛑 Recognition ended - stop signal detected");
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error("Assistant stopped"));
        return;
      }

      // In continuous mode, if recognition ends without detecting wake word, restart it
      if (
        !wakeWordDetected &&
        recognitionStarted &&
        startAttempts < maxStartAttempts
      ) {
        startAttempts++;
        console.log(
          `⏳ Recognition ended, restarting... (attempt ${startAttempts}/${maxStartAttempts})`,
        );
        try {
          // Add small delay before restarting to allow browser to reset
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.error("❌ Failed to restart listener:", error);
              if (timeoutId) clearTimeout(timeoutId);
              reject(new Error("Failed to restart wake word listener"));
            }
          }, 100);
        } catch (error) {
          console.error("❌ Failed to schedule restart:", error);
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error("Failed to restart wake word listener"));
        }
      }
    };

    try {
      console.log("🎤 Starting wake word recognition...");
      recognition.start();
    } catch (error) {
      console.error("❌ Failed to start wake word listener:", error);
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error("Failed to start wake word listener"));
    }
  });
}

// ============================================================================
// 2. LISTEN FOR COMMAND
// ============================================================================

export async function listenForCommand(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Check if we should stop
    if (shouldStop()) {
      reject(new Error("Assistant stopped"));
      return;
    }

    // Check microphone permission and browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error("Your browser does not support audio recording."));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Close the stream immediately after permission check
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Microphone access error:", err);
      reject(
        new Error(
          "Microphone permission denied. Please allow microphone access in your browser.",
        ),
      );
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    currentRecognition = recognition; // Track this instance
    recognition.continuous = true; // Keep listening for continuous speech
    recognition.interimResults = true; // Get interim results to detect speech is happening
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    let hasResult = false;
    let timeoutId: NodeJS.Timeout | null = null;
    let noSpeechCount = 0; // Track consecutive no-speech errors
    let recognitionStarted = false;

    recognition.onstart = () => {
      recognitionStarted = true;
      console.log("🎤 Listening for command... (waiting for speech)");

      // Set timeout for 20 seconds of listening (more generous for user to think and speak)
      timeoutId = setTimeout(() => {
        if (!hasResult) {
          console.warn("⚠️ Command listening timeout (20s)");
          recognition.abort();
          reject(new Error("Command listening timeout. Please try again."));
        }
      }, 20000);
    };

    recognition.onresult = (event: any) => {
      // Check if we should stop
      if (shouldStop()) {
        recognition.abort();
        reject(new Error("Assistant stopped"));
        return;
      }

      let transcript = "";
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
        // Check if this is a final result
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      if (transcript.trim() && isFinal) {
        console.log("✅ Final transcript:", transcript.trim());
        hasResult = true;

        // Clear timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Abort recognition after getting final result
        recognition.abort();
        resolve(transcript.trim());
      } else if (transcript.trim()) {
        console.log("📝 Interim transcript:", transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (timeoutId) clearTimeout(timeoutId);

      // Check if we're stopping
      if (shouldStop()) {
        console.log("🛑 Error handler - stop signal detected");
        reject(new Error("Assistant stopped"));
        return;
      }

      // Handle specific error types with helpful messages
      if (event.error === "no-speech") {
        console.warn("⚠️ No speech detected. Waiting for speech...");
        // In continuous mode, no-speech errors are normal - just keep listening
        // The timeout will handle if they never speak
        noSpeechCount++;
        if (noSpeechCount > 5) {
          // After 5 consecutive no-speech errors, give up
          console.warn("⚠️ Multiple no-speech errors detected");
          recognition.abort();
          reject(
            new Error("No speech detected. Please speak louder and try again."),
          );
        }
        return;
      } else if (event.error === "network") {
        console.warn(
          "⚠️ Network error during speech recognition - retrying...",
        );
        // Network errors are often temporary, retry instead of rejecting
        reject(new Error("Network error. Retrying..."));
      } else if (event.error === "audio-capture") {
        console.error("❌ No microphone found");
        reject(
          new Error(
            "Microphone not found. Please check your microphone connection.",
          ),
        );
      } else if (event.error === "not-allowed") {
        console.error("❌ Microphone permission denied");
        reject(
          new Error(
            "Microphone permission denied. Please allow microphone access.",
          ),
        );
      } else if (event.error === "aborted") {
        console.log("🛑 Recognition aborted");
        if (hasResult) {
          // If we already have a result, don't reject
          return;
        }
        reject(new Error("Assistant stopped"));
      } else {
        console.warn("⚠️ Speech recognition error:", event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (timeoutId) clearTimeout(timeoutId);

      // Check if we're stopping
      if (shouldStop()) {
        console.log("🛑 Recognition ended - stop signal detected");
        reject(new Error("Assistant stopped"));
        return;
      }

      // Only reject if we have no result AND recognition actually started
      if (!hasResult && recognitionStarted) {
        console.warn("⚠️ Recognition ended without result");
        reject(new Error("No speech detected. Please try again."));
      }
    };

    try {
      recognition.start();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error("Failed to start speech recognition"));
    }
  });
}

// ============================================================================
// 3. PARSE INTENT (Wit.ai)
// ============================================================================

export async function parseIntent(userText: string): Promise<WitIntentResult> {
  try {
    if (!userText || userText.trim().length === 0) {
      console.warn("⚠️ Empty user text provided to parseIntent");
      return { intent: null, confidence: 0, entities: {}, raw: {} };
    }

    console.log("🧠 Parsing intent for:", userText);

    const response = await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Intent parsing API error:", response.status, errorText);
      return { intent: null, confidence: 0, entities: {}, raw: {} };
    }

    const data = await response.json();
    console.log(
      "✅ Intent parsed:",
      data.intent,
      "Confidence:",
      data.confidence,
    );
    return data;
  } catch (error) {
    console.error("❌ Intent parsing error:", error);
    return { intent: null, confidence: 0, entities: {}, raw: {} };
  }
}

// ============================================================================
// 4. HANDLE INTENT (using Intent Router)
// ============================================================================

export async function handleIntent(
  intentResult: WitIntentResult,
  userText: string,
  context: LaraContext,
): Promise<string> {
  try {
    return await routeIntent(intentResult, userText, context);
  } catch (error) {
    console.error("Intent handling error:", error);
    return "Sorry, I encountered an error";
  }
}

// ============================================================================
// 5. SPEAK RESPONSE
// ============================================================================

export async function speak(
  text: string,
  isFemaleVoice: boolean = true,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      (utterance as any).language = "en-US";
      utterance.rate = 1;
      utterance.pitch = isFemaleVoice ? 1.5 : 1; // Higher pitch for female voice
      utterance.volume = 1;

      // Try to select a female voice
      if (isFemaleVoice) {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman") ||
            voice.name.toLowerCase().includes("samantha") ||
            voice.name.toLowerCase().includes("victoria") ||
            voice.name.toLowerCase().includes("karen") ||
            voice.name.toLowerCase().includes("moira"),
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        // Handle interrupted/canceled errors gracefully - these are normal when speech is stopped
        if (event.error === "interrupted" || event.error === "canceled") {
          console.log(
            `⚠️ TTS ${event.error} - this is normal when speech is stopped`,
          );
          resolve(); // Resolve instead of rejecting
        } else {
          console.error(`❌ TTS error: ${event.error}`);
          reject(new Error(`TTS error: ${event.error}`));
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// MAIN LOOP - CONTINUOUS LISTENING
// ============================================================================

// Global flag to control the assistant loop
let isRunning = false;
let currentRecognition: any = null; // Track current recognition instance

export function setLaraRunning(running: boolean): void {
  console.log("🔧 setLaraRunning called with:", running);
  isRunning = running;
}

// Check if we should stop immediately
export function shouldStop(): boolean {
  return !isRunning;
}

// Abort any active speech recognition and TTS - FORCE STOP
export function abortCurrentRecognition(): void {
  console.log("🛑 FORCE STOP: Aborting all voice operations...");

  // Abort speech recognition FIRST
  if (currentRecognition) {
    try {
      console.log("🛑 FORCE STOP: Aborting speech recognition instance");
      currentRecognition.abort();
      currentRecognition.stop?.();
      currentRecognition = null;
    } catch (error) {
      console.warn("⚠️ Error aborting recognition:", error);
    }
  }

  // Cancel all speech synthesis
  if (window.speechSynthesis) {
    try {
      console.log("🛑 FORCE STOP: Canceling speech synthesis");
      window.speechSynthesis.cancel();
    } catch (error) {
      console.warn("⚠️ Error canceling speech synthesis:", error);
    }
  }

  // Try to abort any remaining recognition instances
  try {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.abort();
  } catch (error) {
    // Ignore errors
  }
}

export async function startLaraAssistant(context: LaraContext): Promise<void> {
  console.log(
    "🎤 Lara Assistant started",
    context.oneShot ? "(one-shot mode)" : "(continuous mode)",
  );
  isRunning = true;

  while (isRunning && !shouldStop()) {
    try {
      // 1. Wait for wake word
      console.log("👂 Listening for wake word...");
      context.onListeningStateChange?.("wake-word");
      try {
        await wakeWordListener();
      } catch (error) {
        console.warn("⚠️ Wake word detection error:", error);
        // Check if we're stopping
        if (shouldStop()) {
          console.log("🛑 Stop signal received during wake word detection");
          break;
        }
        // In one-shot mode, stop after wake word detection fails
        if (context.oneShot) {
          isRunning = false;
          break;
        }
        continue; // Skip to next iteration
      }

      // Check if we should stop before speaking greeting
      if (shouldStop()) {
        console.log("🛑 Stop signal received before greeting");
        break;
      }

      // 2. Speak greeting (with female voice)
      console.log("🗣️ Speaking greeting...");
      const greetingStartTime = performance.now();
      try {
        await speak("How can I help you?", true); // true = use female voice
        const greetingEndTime = performance.now();
        console.log(
          `✅ Greeting completed (${(greetingEndTime - greetingStartTime).toFixed(0)}ms)`,
        );
      } catch (error) {
        console.error("❌ TTS error during greeting:", error);
        // Continue anyway
      }

      // Check if we should stop before listening for command
      if (shouldStop()) {
        console.log("🛑 Stop signal received before command listening");
        break;
      }

      // REDUCED DELAY: Only 200ms instead of 1000ms to speed up response
      // This gives user minimal time to prepare while keeping responsiveness high
      console.log("⏳ Minimal delay before listening for command...");
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if we should stop before listening for command
      if (shouldStop()) {
        console.log("🛑 Stop signal received before command listening");
        break;
      }

      // 3. Listen for command
      console.log("👂 Listening for command...");
      context.onListeningStateChange?.("command");
      let command: string;
      const commandStartTime = performance.now();
      try {
        command = await listenForCommand();
        const commandEndTime = performance.now();
        console.log(
          `📝 Command received: "${command}" (${(commandEndTime - commandStartTime).toFixed(0)}ms)`,
        );
      } catch (error) {
        console.warn("⚠️ Command listening error:", error);
        // Check if we're stopping
        if (shouldStop()) {
          console.log("🛑 Stop signal received during command listening");
          break;
        }
        try {
          await speak("Sorry, I did not hear that. Please try again.");
        } catch (ttsError) {
          console.error("TTS error:", ttsError);
        }
        // In one-shot mode, stop after command listening fails
        if (context.oneShot) {
          // Notify UI that we're returning to idle state
          context.onListeningStateChange?.("idle");
          isRunning = false;
          break;
        }
        continue; // Skip to next iteration
      }

      // Check if we should stop before parsing intent
      if (shouldStop()) {
        console.log("🛑 Stop signal received before intent parsing");
        break;
      }

      // 4. Parse intent
      console.log("🧠 Parsing intent...");
      context.onListeningStateChange?.("processing");
      const parseStartTime = performance.now();
      let intentResult: WitIntentResult;
      try {
        intentResult = await parseIntent(command);
        const parseEndTime = performance.now();
        console.log(
          "✅ Intent parsed:",
          intentResult,
          `(${(parseEndTime - parseStartTime).toFixed(0)}ms)`,
        );
      } catch (error) {
        console.error("❌ Intent parsing error:", error);
        intentResult = { intent: null, confidence: 0, entities: {}, raw: {} };
      }

      // Check if we should stop before handling intent
      if (shouldStop()) {
        console.log("🛑 Stop signal received before intent handling");
        break;
      }

      // 5. Handle intent (non-blocking - don't await)
      console.log("⚙️ Handling intent...");
      let result: string | null;
      try {
        // Notify UI that we're processing (for task operations)
        if (
          command.toLowerCase().includes("add") &&
          command.toLowerCase().includes("task")
        ) {
          context.onTaskStatusChange?.("processing", "Adding task...");
        }

        const intentStartTime = performance.now();
        result = await handleIntent(intentResult, command, context);
        const intentEndTime = performance.now();
        console.log(
          "⚙️ Intent handled:",
          `(${(intentEndTime - intentStartTime).toFixed(0)}ms)`,
        );

        // Check if we should stop after handling intent
        if (shouldStop()) {
          console.log(
            "🛑 Stop signal received during intent handling - aborting",
          );
          context.onTaskStatusChange?.("error", "Task cancelled");
          break;
        }

        // Notify UI that processing is complete
        if (
          command.toLowerCase().includes("add") &&
          command.toLowerCase().includes("task")
        ) {
          context.onTaskStatusChange?.("completed", "Task added successfully");
        }
      } catch (error) {
        console.error("❌ Intent handling error:", error);

        // Check if error is due to stop signal
        if (shouldStop()) {
          console.log("🛑 Stop signal received - intent handling cancelled");
          context.onTaskStatusChange?.("error", "Task cancelled");
          break;
        }

        result = "Sorry, I could not complete that action.";
        context.onTaskStatusChange?.("error", "Failed to add task");
      }

      // Check if we should stop before speaking confirmation
      if (shouldStop()) {
        console.log("🛑 Stop signal received before confirmation");
        break;
      }

      // 6. Speak confirmation (non-blocking - don't await)
      console.log("🗣️ Speaking confirmation...");
      // Don't await the speech - let it play in background
      // This allows navigation to happen immediately
      if (result) {
        speak(result).catch((error) => {
          console.error("❌ TTS error during confirmation:", error);
        });
      } else {
        speak("Done").catch((error) => {
          console.error("❌ TTS error during confirmation:", error);
        });
      }

      console.log("✅ Command completed");

      // In one-shot mode, stop after one command
      if (context.oneShot) {
        console.log("🛑 One-shot mode: stopping after command");
        // Notify UI that we're returning to idle state
        context.onListeningStateChange?.("idle");
        isRunning = false;
        break;
      }
    } catch (error) {
      console.error("❌ Unexpected error in Lara loop:", error);
      try {
        await speak("An unexpected error occurred. Please try again.");
      } catch (ttsError) {
        console.error("TTS error:", ttsError);
      }
      // In one-shot mode, stop after error
      if (context.oneShot) {
        // Notify UI that we're returning to idle state
        context.onListeningStateChange?.("idle");
        isRunning = false;
        break;
      }
    }
  }
}

// ============================================================================
// STOP ASSISTANT
// ============================================================================

export function stopLaraAssistant(): void {
  console.log("🛑 Lara Assistant stopped");
  isRunning = false;

  // Abort any active speech recognition immediately
  abortCurrentRecognition();

  // Cancel any ongoing speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
