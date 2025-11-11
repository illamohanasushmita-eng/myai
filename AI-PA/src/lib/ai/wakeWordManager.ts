/**
 * Wake Word Manager
 * Manages persistent wake word listening lifecycle
 * Ensures the listener never stops unless explicitly disabled
 */

export interface WakeWordManagerConfig {
  onWakeWordDetected?: () => void;
  onError?: (error: string) => void;
  language?: string;
}

export interface WakeWordManagerState {
  isListening: boolean;
  isProcessing: boolean;
  lastDetectedAt?: number;
  errorCount: number;
}

const WAKE_WORD_VARIATIONS = [
  'hey lara',
  'hey laura',
  'hey lora',
  'hey larra',
  'hey laira',
  'hey lera',
];

class WakeWordManager {
  private recognition: any = null;
  private config: WakeWordManagerConfig;
  private state: WakeWordManagerState = {
    isListening: false,
    isProcessing: false,
    errorCount: 0,
  };
  private restartTimeoutId: NodeJS.Timeout | null = null;
  private isDisabled = false;
  private isMounted = true;

  constructor(config: WakeWordManagerConfig = {}) {
    this.config = config;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      this.config.onError?.('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.language = this.config.language || 'en-US';

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('🎤 Wake word manager: listening started');
      this.state.isListening = true;
      this.state.errorCount = 0;
    };

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          console.log('🎤 Transcript:', transcript);

          if (this.isWakeWordDetected(transcript)) {
            console.log('✅ Wake word detected!');
            this.state.lastDetectedAt = Date.now();
            this.state.isProcessing = true;

            // Stop listening during processing
            try {
              this.recognition.stop();
            } catch (e) {
              console.error('Error stopping recognition:', e);
            }

            // Call the callback
            this.config.onWakeWordDetected?.();
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('🎤 Recognition error:', event.error);

      if (event.error === 'aborted') {
        return;
      }

      if (event.error === 'no-speech') {
        console.log('🎤 No speech detected, will restart...');
        return;
      }

      this.state.errorCount++;
      if (this.state.errorCount > 5) {
        console.error('Too many errors, stopping');
        this.config.onError?.(`Too many errors: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      console.log('🎤 Wake word manager: listening ended');
      this.state.isListening = false;

      if (!this.isMounted || this.isDisabled) {
        console.log('🎤 Manager unmounted or disabled, not restarting');
        return;
      }

      // If not processing, restart immediately
      if (!this.state.isProcessing) {
        console.log('🎤 Restarting wake word listener...');
        this.start();
      }
    };
  }

  private isWakeWordDetected(transcript: string): boolean {
    return WAKE_WORD_VARIATIONS.some(variation =>
      transcript.includes(variation)
    );
  }

  public start() {
    if (!this.recognition || this.isDisabled) return;

    if (this.state.isListening) {
      console.log('🎤 Already listening');
      return;
    }

    try {
      console.log('🎤 Starting wake word listener');
      this.recognition.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  }

  public stop() {
    if (!this.recognition) return;

    try {
      console.log('🎤 Stopping wake word listener');
      this.recognition.stop();
      this.state.isListening = false;
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
  }

  public restart() {
    console.log('🎤 Restarting wake word listener');
    this.state.isProcessing = false;

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
    }

    this.restartTimeoutId = setTimeout(() => {
      if (this.isMounted && !this.isDisabled) {
        this.start();
      }
    }, 300);
  }

  public disable() {
    console.log('🎤 Disabling wake word manager');
    this.isDisabled = true;
    this.stop();
  }

  public enable() {
    console.log('🎤 Enabling wake word manager');
    this.isDisabled = false;
    this.start();
  }

  public destroy() {
    console.log('🎤 Destroying wake word manager');
    this.isMounted = false;
    this.stop();

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
    }

    this.recognition = null;
  }

  public getState(): WakeWordManagerState {
    return { ...this.state };
  }
}

// Singleton instance
let managerInstance: WakeWordManager | null = null;

export function getWakeWordManager(
  config?: WakeWordManagerConfig
): WakeWordManager {
  if (!managerInstance) {
    managerInstance = new WakeWordManager(config);
  }
  return managerInstance;
}

export function destroyWakeWordManager() {
  if (managerInstance) {
    managerInstance.destroy();
    managerInstance = null;
  }
}

