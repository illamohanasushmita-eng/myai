import { z } from 'zod';

export const VoiceCommandIntentSchema = z.object({
  intent: z.enum([
    'show_tasks',
    'add_task',
    'show_reminders',
    'add_reminder',
    'show_schedule',
    'show_health',
    'show_professional',
    'show_home',
    'show_growth',
    'play_music',
    'navigate',
    'unknown',
  ]),
  action: z.string().describe('The action to perform'),
  parameters: z.record(z.any()).optional().describe('Additional parameters for the action'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the intent'),
  message: z.string().describe('User-friendly message about the action'),
});

export type VoiceCommandIntent = z.infer<typeof VoiceCommandIntentSchema>;

export interface VoiceCommandResponse {
  success: boolean;
  intent: VoiceCommandIntent;
  transcribedText: string;
  error?: string;
}

export interface VoiceCommandError {
  code: string;
  message: string;
  userMessage: string;
}

export const VOICE_COMMAND_ERRORS = {
  NO_SPEECH: {
    code: 'NO_SPEECH',
    message: 'No speech was detected',
    userMessage: 'I did not hear anything. Please try again.',
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network error occurred',
    userMessage: 'Network error. Please check your connection.',
  },
  NOT_ALLOWED: {
    code: 'NOT_ALLOWED',
    message: 'Microphone permission denied',
    userMessage: 'Microphone permission denied. Please enable it in settings.',
  },
  SERVICE_NOT_AVAILABLE: {
    code: 'SERVICE_NOT_AVAILABLE',
    message: 'Speech recognition service not available',
    userMessage: 'Speech recognition is not available in your browser.',
  },
  GEMINI_ERROR: {
    code: 'GEMINI_ERROR',
    message: 'Failed to process command with Gemini',
    userMessage: 'Failed to process your command. Please try again.',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
  },
};

export async function processVoiceCommand(
  transcribedText: string,
  userId?: string
): Promise<VoiceCommandResponse> {
  try {
    const response = await fetch('/api/ai/voice-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: transcribedText,
        userId: userId || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
}

export function getErrorMessage(errorCode: string): VoiceCommandError {
  return (
    VOICE_COMMAND_ERRORS[errorCode as keyof typeof VOICE_COMMAND_ERRORS] ||
    VOICE_COMMAND_ERRORS.UNKNOWN_ERROR
  );
}

export function parseVoiceCommandIntent(text: string): {
  intent: string;
  keywords: string[];
} {
  const lowerText = text.toLowerCase();

  const intents = {
    show_tasks: ['show.*tasks', 'list.*tasks', 'my tasks', 'what.*tasks'],
    add_task: ['add.*task', 'create.*task', 'new task', 'add.*to.*do'],
    show_reminders: ['show.*reminders', 'list.*reminders', 'my reminders'],
    add_reminder: ['add.*reminder', 'set.*reminder', 'remind me'],
    show_schedule: ['show.*schedule', 'what.*schedule', 'my schedule'],
    show_health: ['show.*health', 'health data', 'fitness', 'workout'],
    show_professional: ['show.*professional', 'work', 'projects', 'meetings'],
    show_home: ['show.*home', 'home tasks', 'chores', 'family'],
    show_growth: ['show.*growth', 'personal growth', 'learning', 'goals'],
    play_music: ['play.*music', 'play.*song', 'play.*favorite', 'spotify'],
    navigate: ['go to', 'navigate to', 'open', 'show me'],
  };

  for (const [intent, patterns] of Object.entries(intents)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        return {
          intent,
          keywords: patterns,
        };
      }
    }
  }

  return {
    intent: 'unknown',
    keywords: [],
  };
}

