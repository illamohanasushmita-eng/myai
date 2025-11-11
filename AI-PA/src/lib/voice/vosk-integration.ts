/**
 * Vosk Integration with Voice Automation
 * Complete workflow: Wake-word detection → Command recognition → Action execution
 * 
 * Usage:
 * const workflow = new VoskVoiceWorkflow();
 * await workflow.initialize();
 * await workflow.start();
 */

import {
  startRecognizer,
  stopRecognizer,
  loadVoskModel,
} from './vosk-recognizer';

// ============================================================================
// TYPES
// ============================================================================

export interface VoskWorkflowConfig {
  modelPath?: string;
  wakeWord?: string;
  onWakeWordDetected?: () => void;
  onCommandRecognized?: (command: string) => void;
  onError?: (error: string) => void;
}

export interface VoskWorkflowState {
  isInitialized: boolean;
  isListening: boolean;
  wakeWordDetected: boolean;
  lastCommand: string | null;
}

// ============================================================================
// VOSK VOICE WORKFLOW
// ============================================================================

export class VoskVoiceWorkflow {
  private config: VoskWorkflowConfig;
  private state: VoskWorkflowState;
  private commandBuffer: string[] = [];
  private wakeWordTimeout: NodeJS.Timeout | null = null;

  constructor(config: VoskWorkflowConfig = {}) {
    this.config = {
      modelPath: '/vosk/model.zip',
      wakeWord: 'hey lara',
      ...config,
    };

    this.state = {
      isInitialized: false,
      isListening: false,
      wakeWordDetected: false,
      lastCommand: null,
    };
  }

  // ========================================================================
  // INITIALIZE
  // ========================================================================

  async initialize(): Promise<void> {
    try {
      console.log('🎤 Initializing Vosk workflow...');

      if (this.state.isInitialized) {
        console.log('⚠️ Workflow already initialized');
        return;
      }

      // Load model
      await loadVoskModel(this.config.modelPath);

      this.state.isInitialized = true;
      console.log('✅ Vosk workflow initialized');
    } catch (error) {
      const errorMsg = `Initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error('❌', errorMsg);
      this.config.onError?.(errorMsg);
      throw error;
    }
  }

  // ========================================================================
  // START LISTENING
  // ========================================================================

  async start(): Promise<void> {
    try {
      console.log('🎤 Starting Vosk workflow...');

      if (!this.state.isInitialized) {
        await this.initialize();
      }

      if (this.state.isListening) {
        console.log('⚠️ Workflow already listening');
        return;
      }

      await startRecognizer(
        () => this.handleWakeWord(),
        (text) => this.handleRecognizedText(text),
        (error) => this.handleError(error),
        (partial) => this.handlePartialResult(partial)
      );

      this.state.isListening = true;
      console.log('✅ Vosk workflow started');
    } catch (error) {
      const errorMsg = `Start failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error('❌', errorMsg);
      this.config.onError?.(errorMsg);
      throw error;
    }
  }

  // ========================================================================
  // STOP LISTENING
  // ========================================================================

  stop(): void {
    try {
      console.log('🎤 Stopping Vosk workflow...');

      stopRecognizer();

      if (this.wakeWordTimeout) {
        clearTimeout(this.wakeWordTimeout);
        this.wakeWordTimeout = null;
      }

      this.state.isListening = false;
      this.state.wakeWordDetected = false;
      this.commandBuffer = [];

      console.log('✅ Vosk workflow stopped');
    } catch (error) {
      console.error('❌ Error stopping workflow:', error);
    }
  }

  // ========================================================================
  // HANDLE WAKE WORD
  // ========================================================================

  private handleWakeWord(): void {
    console.log('✅ Wake word detected!');

    this.state.wakeWordDetected = true;
    this.commandBuffer = [];

    // Call callback
    this.config.onWakeWordDetected?.();

    // Reset wake word detection after 10 seconds
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
    }

    this.wakeWordTimeout = setTimeout(() => {
      console.log('🎤 Wake word timeout - resetting');
      this.state.wakeWordDetected = false;
      this.commandBuffer = [];
    }, 10000);
  }

  // ========================================================================
  // HANDLE RECOGNIZED TEXT
  // ========================================================================

  private handleRecognizedText(text: string): void {
    console.log('🎤 Recognized text:', text);

    if (this.state.wakeWordDetected) {
      // Remove wake word from text
      const cleanText = text
        .toLowerCase()
        .replace(this.config.wakeWord || 'hey lara', '')
        .trim();

      if (cleanText) {
        this.commandBuffer.push(cleanText);
        this.state.lastCommand = cleanText;

        console.log('🎤 Command buffered:', cleanText);
        this.config.onCommandRecognized?.(cleanText);

        // Reset wake word timeout
        if (this.wakeWordTimeout) {
          clearTimeout(this.wakeWordTimeout);
        }

        this.wakeWordTimeout = setTimeout(() => {
          console.log('🎤 Command timeout - processing buffer');
          this.processCommandBuffer();
        }, 2000);
      }
    }
  }

  // ========================================================================
  // HANDLE PARTIAL RESULT
  // ========================================================================

  private handlePartialResult(partial: string): void {
    console.log('🎤 Partial result:', partial);
  }

  // ========================================================================
  // HANDLE ERROR
  // ========================================================================

  private handleError(error: string): void {
    console.error('❌ Vosk error:', error);
    this.config.onError?.(error);
  }

  // ========================================================================
  // PROCESS COMMAND BUFFER
  // ========================================================================

  private processCommandBuffer(): void {
    if (this.commandBuffer.length === 0) {
      return;
    }

    const fullCommand = this.commandBuffer.join(' ');
    console.log('🎤 Processing command:', fullCommand);

    this.state.wakeWordDetected = false;
    this.commandBuffer = [];
  }

  // ========================================================================
  // GET STATE
  // ========================================================================

  getState(): VoskWorkflowState {
    return { ...this.state };
  }

  // ========================================================================
  // IS READY
  // ========================================================================

  isReady(): boolean {
    return this.state.isInitialized && this.state.isListening;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let workflowInstance: VoskVoiceWorkflow | null = null;

export function getVoskWorkflow(
  config?: VoskWorkflowConfig
): VoskVoiceWorkflow {
  if (!workflowInstance) {
    workflowInstance = new VoskVoiceWorkflow(config);
  }
  return workflowInstance;
}

export function resetVoskWorkflow(): void {
  if (workflowInstance) {
    workflowInstance.stop();
    workflowInstance = null;
  }
}

