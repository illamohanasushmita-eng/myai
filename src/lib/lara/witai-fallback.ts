/**
 * Wit.ai Fallback Pattern Matching
 * Used when Wit.ai doesn't recognize intents
 */

export interface FallbackIntent {
  intent: string | null;
  confidence: number;
  extractedData: {
    songName?: string;
    taskText?: string;
    reminderText?: string;
    navigationTarget?: string;
    time?: string;
  };
}

// Pattern matching rules for fallback
// IMPORTANT: Order matters! More specific patterns should come first
const INTENT_PATTERNS = {
  // MOST SPECIFIC PATTERNS FIRST
  show_tasks: [
    /show\s+(?:my\s+)?tasks?(?:\s+(?:list|page))?[\s.!?]*$/i,
    /what\s+are\s+my\s+tasks?[\s.!?]*$/i,
    /list\s+(?:my\s+)?tasks?[\s.!?]*$/i,
    /display\s+(?:my\s+)?tasks?[\s.!?]*$/i,
    /open\s+(?:my\s+)?tasks?(?:\s+(?:list|page))?[\s.!?]*$/i,
  ],
  show_reminders: [
    /show\s+(?:my\s+)?reminders?(?:\s+(?:list|page))?[\s.!?]*$/i,
    /what\s+are\s+my\s+reminders?[\s.!?]*$/i,
    /list\s+(?:my\s+)?reminders?[\s.!?]*$/i,
    /display\s+(?:my\s+)?reminders?[\s.!?]*$/i,
    /open\s+(?:my\s+)?reminders?(?:\s+(?:list|page))?[\s.!?]*$/i,
  ],
  play_music: [
    /play\s+(?:me\s+)?(.+?)\s+(?:song|music|track)[\s.!?]*$/i,
    /play\s+(?:the\s+)?(?:song|music|track)\s+(?:called\s+)?(.+?)[\s.!?]*$/i,
    /play\s+(?:me\s+)?(?!a\s+(?:song|music|track))(.+?)(?:\s+(?:song|music|track))?[\s.!?]*$/i,
  ],
  add_task: [
    /add\s+(?:a\s+)?task\s+(?:to\s+)?(?:my\s+)?(?:list)?\s*:?\s*(.+?)[\s.!?]*$/i,
    /create\s+(?:a\s+)?task\s+(?:called)?\s+(.+?)[\s.!?]*$/i,
    /add\s+(.+?)\s+to\s+my\s+tasks?[\s.!?]*$/i,
  ],
  add_reminder: [
    /(?:remind|set\s+reminder)\s+me\s+(?:to\s+)?(.+?)\s+(?:at|in)\s+(.+?)[\s.!?]*$/i,
    /add\s+(?:a\s+)?reminder\s+(?:to\s+)?(.+?)[\s.!?]*$/i,
    /create\s+(?:a\s+)?reminder\s+(?:for)?\s+(.+?)[\s.!?]*$/i,
  ],
  navigate: [
    /(?:go\s+to|navigate\s+to)\s+(?:the\s+)?(.+?)\s+(?:page|section)?[\s.!?]*$/i,
    /open\s+(?:the\s+)?(.+?)\s+(?:page|section)[\s.!?]*$/i,
  ],
};

/**
 * Fallback intent detection using pattern matching
 */
export function detectIntentWithFallback(text: string): FallbackIntent {
  const lowerText = text.toLowerCase().trim();

  // Try each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const extractedData = extractDataFromMatch(intent, match, text);
        return {
          intent,
          confidence: 0.7, // Fallback confidence
          extractedData,
        };
      }
    }
  }

  // No pattern matched
  return {
    intent: "general_query",
    confidence: 0.3,
    extractedData: {},
  };
}

/**
 * Extract relevant data from regex match
 */
function extractDataFromMatch(
  intent: string,
  match: RegExpMatchArray,
  originalText: string,
): FallbackIntent["extractedData"] {
  const data: FallbackIntent["extractedData"] = {};

  switch (intent) {
    case "play_music":
      if (match[1]) {
        data.songName = match[1].trim();
      }
      break;

    case "add_task":
      if (match[1]) {
        data.taskText = match[1].trim();
      }
      break;

    case "add_reminder":
      if (match[1]) {
        data.reminderText = match[1].trim();
      }
      if (match[2]) {
        data.time = match[2].trim();
      }
      break;

    case "navigate":
      if (match[1]) {
        const target = match[1].toLowerCase().trim();
        data.navigationTarget = mapNavigationTarget(target);
      }
      break;
  }

  return data;
}

/**
 * Map navigation text to actual routes
 */
function mapNavigationTarget(target: string): string {
  const navigationMap: Record<string, string> = {
    tasks: "/professional",
    professional: "/professional",
    reminders: "/reminders",
    reminder: "/reminders",
    health: "/healthcare",
    healthcare: "/healthcare",
    growth: "/personal-growth",
    "personal growth": "/personal-growth",
    home: "/dashboard",
    dashboard: "/dashboard",
  };

  return navigationMap[target] || target;
}

/**
 * Merge Wit.ai result with fallback
 */
export function mergeWithFallback(
  witResult: any,
  fallbackResult: FallbackIntent,
): FallbackIntent {
  // If Wit.ai found an intent, use it
  if (witResult.intent) {
    return {
      intent: witResult.intent,
      confidence: witResult.confidence || 0.8,
      extractedData: witResult.entities || {},
    };
  }

  // Otherwise use fallback
  return fallbackResult;
}
