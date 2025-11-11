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

import { routeIntent, WitIntentResult } from '@/lib/lara/intentRouter';

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
}

// ============================================================================
// 1. WAKE WORD LISTENER
// ============================================================================

export async function wakeWordListener(): Promise<void> {
  return new Promise((resolve, reject) => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false; // Single recognition session
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let wakeWordDetected = false;
    let isRestarting = false; // Flag to prevent duplicate restart attempts
    let timeoutId: NodeJS.Timeout | null = null;
    let restartTimeoutId: NodeJS.Timeout | null = null;

    // Set timeout for wake word detection (30 seconds total)
    timeoutId = setTimeout(() => {
      if (!wakeWordDetected) {
        recognition.abort();
        reject(new Error('Wake word detection timeout. Please say "Hey Lara" to start.'));
      }
    }, 30000);

    recognition.onstart = () => {
      console.log('👂 Listening for wake word "Hey Lara"...');
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      console.log('🎤 Detected speech:', transcript);

      // Check if wake word is detected
      // Remove punctuation and extra spaces for better matching
      const cleanTranscript = transcript
        .toLowerCase()
        .replace(/[.,!?;:]/g, '') // Remove punctuation
        .trim();

      // Check for wake word variations: "hey lara", "laura", "lera", "lawra"
      const wakeWordPatterns = [
        'hey lara',
        'hey laura',
        'hey lera',
        'hey lawra',
        'lara',
        'laura',
        'lera',
        'lawra'
      ];

      const isWakeWordDetected = wakeWordPatterns.some(pattern =>
        cleanTranscript.includes(pattern)
      );

      if (isWakeWordDetected) {
        console.log('🎤 Wake word detected!');
        wakeWordDetected = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (restartTimeoutId) clearTimeout(restartTimeoutId);
        recognition.abort();
        resolve();
      }
    };

    recognition.onerror = (event: any) => {
      // Only reject on actual errors, not on no-speech
      if (event.error === 'no-speech') {
        console.warn('⚠️ No speech detected, will restart on end...');
        // Don't restart here - let onend handle it
        return;
      } else if (event.error === 'network') {
        console.warn('⚠️ Network error during wake word detection - retrying...');
        // Network errors are often temporary, so we'll retry instead of rejecting
        // Let onend handle the restart
        return;
      } else if (event.error === 'audio-capture') {
        console.error('❌ No microphone found');
        if (timeoutId) clearTimeout(timeoutId);
        if (restartTimeoutId) clearTimeout(restartTimeoutId);
        recognition.abort();
        reject(new Error('Microphone not found. Please check your microphone connection.'));
      } else if (event.error === 'not-allowed') {
        console.error('❌ Microphone permission denied');
        if (timeoutId) clearTimeout(timeoutId);
        if (restartTimeoutId) clearTimeout(restartTimeoutId);
        recognition.abort();
        reject(new Error('Microphone permission denied. Please allow microphone access.'));
      } else if (event.error === 'aborted') {
        // This is expected when we abort after detecting wake word
        return;
      } else {
        console.error('❌ Wake word detection error:', event.error);
        if (timeoutId) clearTimeout(timeoutId);
        if (restartTimeoutId) clearTimeout(restartTimeoutId);
        recognition.abort();
        reject(new Error(`Wake word detection error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      // If recognition ended and we haven't detected the wake word, restart
      if (!wakeWordDetected && !isRestarting) {
        isRestarting = true;
        restartTimeoutId = setTimeout(() => {
          if (!wakeWordDetected) {
            try {
              recognition.start();
              isRestarting = false;
            } catch (error) {
              console.error('❌ Failed to restart listener:', error);
              clearTimeout(timeoutId);
              isRestarting = false;
              reject(new Error('Failed to restart wake word listener'));
            }
          }
        }, 500);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (restartTimeoutId) clearTimeout(restartTimeoutId);
      reject(new Error('Failed to start wake word listener'));
    }
  });
}

// ============================================================================
// 2. LISTEN FOR COMMAND
// ============================================================================

export async function listenForCommand(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let hasResult = false;
    let timeoutId: NodeJS.Timeout | null = null;

    recognition.onstart = () => {
      console.log('🎤 Listening for command...');
      // Set timeout for 10 seconds of listening
      timeoutId = setTimeout(() => {
        if (!hasResult) {
          recognition.abort();
          reject(new Error('No speech detected. Please speak louder and try again.'));
        }
      }, 10000);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        hasResult = true;
        if (timeoutId) clearTimeout(timeoutId);
        resolve(transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (timeoutId) clearTimeout(timeoutId);
      // Handle specific error types with helpful messages
      if (event.error === 'no-speech') {
        console.warn('⚠️ No speech detected. Please speak louder.');
        reject(new Error('No speech detected. Please speak louder and try again.'));
      } else if (event.error === 'network') {
        console.warn('⚠️ Network error during speech recognition - retrying...');
        // Network errors are often temporary, retry instead of rejecting
        reject(new Error('Network error. Retrying...'));
      } else if (event.error === 'audio-capture') {
        console.error('❌ No microphone found');
        reject(new Error('Microphone not found. Please check your microphone connection.'));
      } else if (event.error === 'not-allowed') {
        console.error('❌ Microphone permission denied');
        reject(new Error('Microphone permission denied. Please allow microphone access.'));
      } else {
        console.warn('⚠️ Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (!hasResult) {
        reject(new Error('No speech detected. Please try again.'));
      }
    };

    try {
      recognition.start();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error('Failed to start speech recognition'));
    }
  });
}

// ============================================================================
// 3. PARSE INTENT (Wit.ai)
// ============================================================================

export async function parseIntent(userText: string): Promise<WitIntentResult> {
  try {
    if (!userText || userText.trim().length === 0) {
      console.warn('⚠️ Empty user text provided to parseIntent');
      return { intent: null, confidence: 0, entities: {}, raw: {} };
    }

    console.log('🧠 Parsing intent for:', userText);

    const response = await fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Intent parsing API error:', response.status, errorText);
      return { intent: null, confidence: 0, entities: {}, raw: {} };
    }

    const data = await response.json();
    console.log('✅ Intent parsed:', data.intent, 'Confidence:', data.confidence);
    return data;
  } catch (error) {
    console.error('❌ Intent parsing error:', error);
    return { intent: null, confidence: 0, entities: {}, raw: {} };
  }
}

// ============================================================================
// 4. HANDLE INTENT (using Intent Router)
// ============================================================================

export async function handleIntent(
  intentResult: WitIntentResult,
  userText: string,
  context: LaraContext
): Promise<string> {
  try {
    return await routeIntent(intentResult, userText, context);
  } catch (error) {
    console.error('Intent handling error:', error);
    return 'Sorry, I encountered an error';
  }
}

// ============================================================================
// 5. SPEAK RESPONSE
// ============================================================================

export async function speak(text: string, isFemaleVoice: boolean = true): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      (utterance as any).language = 'en-US';
      utterance.rate = 1;
      utterance.pitch = isFemaleVoice ? 1.5 : 1; // Higher pitch for female voice
      utterance.volume = 1;

      // Try to select a female voice
      if (isFemaleVoice) {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('victoria') ||
            voice.name.toLowerCase().includes('karen') ||
            voice.name.toLowerCase().includes('moira')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        // Handle interrupted/cancelled errors gracefully - these are normal when speech is stopped
        if (event.error === 'interrupted' || event.error === 'cancelled') {
          console.log(`⚠️ TTS ${event.error} - this is normal when speech is stopped`);
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

export function setLaraRunning(running: boolean): void {
  isRunning = running;
}

export async function startLaraAssistant(context: LaraContext): Promise<void> {
  console.log('🎤 Lara Assistant started');
  isRunning = true;

  while (isRunning) {
    try {
      // 1. Wait for wake word
      console.log('👂 Listening for wake word...');
      try {
        await wakeWordListener();
      } catch (error) {
        console.warn('⚠️ Wake word detection error:', error);
        continue; // Skip to next iteration
      }

      // 2. Speak greeting (with female voice)
      console.log('🗣️ Speaking greeting...');
      try {
        await speak('How can I help you?', true); // true = use female voice
      } catch (error) {
        console.error('❌ TTS error during greeting:', error);
        // Continue anyway
      }

      // 3. Listen for command
      console.log('👂 Listening for command...');
      let command: string;
      try {
        command = await listenForCommand();
        console.log('📝 Command received:', command);
      } catch (error) {
        console.warn('⚠️ Command listening error:', error);
        try {
          await speak('Sorry, I did not hear that. Please try again.');
        } catch (ttsError) {
          console.error('TTS error:', ttsError);
        }
        continue; // Skip to next iteration
      }

      // 4. Parse intent
      console.log('🧠 Parsing intent...');
      let intentResult: WitIntentResult;
      try {
        intentResult = await parseIntent(command);
        console.log('✅ Intent parsed:', intentResult);
      } catch (error) {
        console.error('❌ Intent parsing error:', error);
        intentResult = { intent: null, confidence: 0, entities: {}, raw: {} };
      }

      // 5. Handle intent
      console.log('⚙️ Handling intent...');
      let result: string | null;
      try {
        result = await handleIntent(intentResult, command, context);
      } catch (error) {
        console.error('❌ Intent handling error:', error);
        result = 'Sorry, I could not complete that action.';
      }

      // 6. Speak confirmation
      console.log('🗣️ Speaking confirmation...');
      try {
        if (result) {
          await speak(result);
        } else {
          await speak('Done');
        }
      } catch (error) {
        console.error('❌ TTS error during confirmation:', error);
      }

      console.log('✅ Command completed');
    } catch (error) {
      console.error('❌ Unexpected error in Lara loop:', error);
      try {
        await speak('An unexpected error occurred. Please try again.');
      } catch (ttsError) {
        console.error('TTS error:', ttsError);
      }
    }
  }
}

// ============================================================================
// STOP ASSISTANT
// ============================================================================

export function stopLaraAssistant(): void {
  console.log('🛑 Lara Assistant stopped');
  isRunning = false;
  window.speechSynthesis.cancel();
}

