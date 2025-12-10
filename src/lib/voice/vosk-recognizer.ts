/**
 * Vosk Wake-Word Detection & Speech Recognition
 * Browser-based continuous listening with Vosk
 *
 * Features:
 * - Load Vosk model from /public/vosk/model.zip
 * - Continuous microphone audio streaming
 * - Wake-word detection: "hey lara"
 * - Real-time speech recognition
 * - Async/await pattern with callbacks
 */

declare global {
  interface Window {
    Vosk: any;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface VoskRecognizerConfig {
  sampleRate?: number;
  modelPath?: string;
}

export interface VoskRecognizerCallbacks {
  onWakeWord?: () => void;
  onRecognize?: (text: string) => void;
  onError?: (error: string) => void;
  onPartialResult?: (text: string) => void;
}

export interface VoskRecognizerState {
  isRunning: boolean;
  audioContext: AudioContext | null;
  processor: ScriptProcessorNode | null;
  recognizer: any;
  mediaStream: MediaStream | null;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let voskState: VoskRecognizerState = {
  isRunning: false,
  audioContext: null,
  processor: null,
  recognizer: null,
  mediaStream: null,
};

let voskModel: any = null;
let voskCallbacks: VoskRecognizerCallbacks = {};

// ============================================================================
// LOAD VOSK MODEL
// ============================================================================

export async function loadVoskModel(
  modelPath: string = "/vosk/model.zip",
): Promise<any> {
  try {
    console.log("🎤 Loading Vosk model from:", modelPath);

    // Load Vosk library if not already loaded
    if (!window.Vosk) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/vosk-browser@0.3.0/vosk.js";
      script.async = true;

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      console.log("✅ Vosk library loaded");
    }

    // Fetch model zip file
    const response = await fetch(modelPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("✅ Model file downloaded:", arrayBuffer.byteLength, "bytes");

    // Initialize Vosk model
    const Vosk = window.Vosk;
    voskModel = new Vosk.Model(arrayBuffer);

    console.log("✅ Vosk model initialized successfully");
    return voskModel;
  } catch (error) {
    const errorMsg = `Failed to load Vosk model: ${error instanceof Error ? error.message : String(error)}`;
    console.error("❌", errorMsg);
    voskCallbacks.onError?.(errorMsg);
    throw error;
  }
}

// ============================================================================
// START RECOGNIZER
// ============================================================================

export async function startRecognizer(
  onWakeWord?: () => void,
  onRecognize?: (text: string) => void,
  onError?: (error: string) => void,
  onPartialResult?: (text: string) => void,
): Promise<void> {
  try {
    console.log("🎤 Starting Vosk recognizer...");

    // Store callbacks
    voskCallbacks = { onWakeWord, onRecognize, onError, onPartialResult };

    // Load model if not already loaded
    if (!voskModel) {
      await loadVoskModel();
    }

    // Check if already running
    if (voskState.isRunning) {
      console.log("⚠️ Recognizer already running");
      return;
    }

    // Create AudioContext
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    voskState.audioContext = audioContext;

    // Request microphone access
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    voskState.mediaStream = mediaStream;
    console.log("✅ Microphone access granted");

    // Create audio source
    const source = audioContext.createMediaStreamSource(mediaStream);

    // Create ScriptProcessorNode for audio processing
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    voskState.processor = processor;

    // Initialize recognizer
    const Vosk = window.Vosk;
    const recognizer = new Vosk.KaldiRecognizer(
      voskModel,
      audioContext.sampleRate,
    );
    recognizer.setWords(null);
    voskState.recognizer = recognizer;

    console.log(
      "✅ Recognizer initialized with sample rate:",
      audioContext.sampleRate,
    );

    // Process audio chunks
    processor.onaudioprocess = (event: AudioProcessingEvent) => {
      const inputData = event.inputBuffer.getChannelData(0);

      // Convert float32 to int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Feed to recognizer
      if (recognizer.acceptWaveform(pcmData)) {
        const result = JSON.parse(recognizer.result());
        handleRecognitionResult(result);
      } else {
        const partial = JSON.parse(recognizer.partialResult());
        if (partial.partial) {
          voskCallbacks.onPartialResult?.(partial.partial);
        }
      }
    };

    // Connect audio graph
    source.connect(processor);
    processor.connect(audioContext.destination);

    voskState.isRunning = true;
    console.log("✅ Vosk recognizer started successfully");
  } catch (error) {
    const errorMsg = `Failed to start recognizer: ${error instanceof Error ? error.message : String(error)}`;
    console.error("❌", errorMsg);
    voskCallbacks.onError?.(errorMsg);
    throw error;
  }
}

// ============================================================================
// HANDLE RECOGNITION RESULT
// ============================================================================

function handleRecognitionResult(result: any): void {
  if (!result.result || result.result.length === 0) {
    return;
  }

  const recognizedText = result.result
    .map((item: any) => (item.conf > 0.5 ? item.result : ""))
    .join(" ")
    .trim();

  if (!recognizedText) {
    return;
  }

  console.log("🎤 Recognized text:", recognizedText);

  // Check for wake word
  if (recognizedText.toLowerCase().includes("hey lara")) {
    console.log("✅ Wake word detected!");
    voskCallbacks.onWakeWord?.();
  } else {
    voskCallbacks.onRecognize?.(recognizedText);
  }
}

// ============================================================================
// STOP RECOGNIZER
// ============================================================================

export function stopRecognizer(): void {
  try {
    console.log("🎤 Stopping Vosk recognizer...");

    if (voskState.processor) {
      voskState.processor.disconnect();
      voskState.processor = null;
    }

    if (voskState.mediaStream) {
      voskState.mediaStream.getTracks().forEach((track) => track.stop());
      voskState.mediaStream = null;
    }

    if (voskState.audioContext) {
      voskState.audioContext.close();
      voskState.audioContext = null;
    }

    voskState.recognizer = null;
    voskState.isRunning = false;

    console.log("✅ Vosk recognizer stopped");
  } catch (error) {
    console.error("❌ Error stopping recognizer:", error);
  }
}

// ============================================================================
// GET RECOGNIZER STATE
// ============================================================================

export function getRecognizerState(): VoskRecognizerState {
  return { ...voskState };
}

// ============================================================================
// RESET RECOGNIZER
// ============================================================================

export async function resetRecognizer(): Promise<void> {
  stopRecognizer();
  voskModel = null;
  voskCallbacks = {};
  console.log("✅ Recognizer reset");
}
