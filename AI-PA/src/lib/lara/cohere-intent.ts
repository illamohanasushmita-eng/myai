/**
 * Cohere API Integration for Intent Classification
 * Replaces Wit.ai with Cohere for better intent detection and entity extraction
 */

import { CohereClient } from 'cohere-ai';

export interface CohereIntentResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  raw?: any;
}

const COHERE_SYSTEM_PROMPT = `You are Lara, an AI voice assistant for a Next.js + Supabase application.
Your job is to analyze user speech (converted to text) and return ONLY a structured JSON object defining the user's intent and extracted entities.

CRITICAL RULES:
- Return ONLY valid JSON. No explanations, no markdown, no extra text.
- Always include: "intent", "entities", and "confidence" fields.
- Confidence must be a number between 0 and 1.

ALLOWED INTENTS:
1. "add_task" — User wants to add a task (extract task title)
2. "show_tasks" — User wants to view their tasks page
3. "add_reminder" — User wants to add a reminder (extract description and time)
4. "show_reminders" — User wants to view their reminders page
5. "play_music" — User wants to play music (extract artist, genre, mood)
6. "navigate" — User wants to navigate to a specific page
7. "general_greeting" — User says hi, hello, hey lara, etc.
8. "general_query" — Fallback when intent is unclear

ENTITY EXTRACTION RULES:

For "add_task":
- title (string): What task to add (e.g., "buy groceries", "call mom")

For "add_reminder":
- description (string): What to be reminded about
- time (string): When to remind (if mentioned)

For "play_music":
- artist (string): Artist name if mentioned
- genre (string): Music genre if mentioned
- mood (string): Mood like "relaxing", "energetic", "sad"

For "navigate":
- page (string): Target page like "dashboard", "tasks", "reminders"

EXAMPLES:

Input: "add task to buy groceries"
Output: {"intent": "add_task", "entities": {"title": "buy groceries"}, "confidence": 0.95}

Input: "play some Telugu songs"
Output: {"intent": "play_music", "entities": {"genre": "Telugu"}, "confidence": 0.9}

Input: "show my tasks"
Output: {"intent": "show_tasks", "entities": {}, "confidence": 0.95}

Input: "remind me to call mom at 5 PM"
Output: {"intent": "add_reminder", "entities": {"description": "call mom", "time": "5 PM"}, "confidence": 0.9}

Input: "hey lara"
Output: {"intent": "general_greeting", "entities": {}, "confidence": 0.95}

Now analyze this user input and return ONLY the JSON response:`;

/**
 * Classify intent using Cohere API with SDK
 */
export async function classifyIntentWithCohere(text: string): Promise<CohereIntentResult> {
  try {
    console.log('🧠 [COHERE] Classifying intent for:', text);

    if (!process.env.COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY not found in environment variables');
    }

    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cohere API timeout after 3 seconds')), 3000)
    );

    const response = await Promise.race([
      cohere.chat({
        model: 'command-r-plus',
        message: text,
        preamble: COHERE_SYSTEM_PROMPT,
        temperature: 0.1,
        maxTokens: 200,
      }),
      timeoutPromise,
    ]) as any;

    console.log('🧠 [COHERE] Raw response:', response.text);

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(response.text);
    } catch (parseError) {
      console.warn('⚠️ [COHERE] JSON parsing failed, trying to extract JSON');
      
      // Try to extract JSON from response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Failed to parse Cohere response as JSON');
        }
      } else {
        throw new Error('No JSON found in Cohere response');
      }
    }

    // Validate required fields
    if (!parsed.intent || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid Cohere response format');
    }

    const result: CohereIntentResult = {
      intent: parsed.intent,
      entities: parsed.entities || {},
      confidence: parsed.confidence,
      raw: response,
    };

    console.log('✅ [COHERE] Intent classified:', result);
    return result;

  } catch (error) {
    console.error('❌ [COHERE] Classification failed:', error);
    throw error;
  }
}

/**
 * Fallback pattern matching for when Cohere fails
 */
export function detectIntentWithFallback(text: string): CohereIntentResult {
  const lowerText = text.toLowerCase().trim();

  // Tasks intents
  if (lowerText.match(/show\s+(?:my\s+)?tasks?|open\s+tasks?/i)) {
    return {
      intent: 'tasks_show',
      entities: {},
      confidence: 0.7,
    };
  }

  // Reminders intents
  if (lowerText.match(/show\s+(?:my\s+)?reminders?|open\s+reminders?/i)) {
    return {
      intent: 'reminders_show',
      entities: {},
      confidence: 0.7,
    };
  }

  // Music playback intents
  if (lowerText.match(/play\s+(?:me\s+)?(.+?)(?:\s+(?:song|music|track|songs))?s?$/i)) {
    const match = lowerText.match(/play\s+(?:me\s+)?(.+?)(?:\s+(?:song|music|track|songs))?s?$/i);
    let artist = match?.[1] || '';
    // Remove trailing "s" if it's part of "songs"
    artist = artist.replace(/\s+songs?$/i, '').trim();
    return {
      intent: 'play_music',
      entities: { artist: artist },
      confidence: 0.7,
    };
  }

  // Task creation intents
  if (lowerText.match(/add\s+(?:a\s+)?task|add\s+task\s+to/i)) {
    const match = lowerText.match(/add\s+(?:a\s+)?task\s+(?:to\s+)?(.+)/i);
    const title = match?.[1] || '';
    return {
      intent: 'task_create',
      entities: { title: title.trim() },
      confidence: 0.7,
    };
  }

  // Reminder creation intents
  if (lowerText.match(/(?:remind|set\s+reminder)\s+me/i)) {
    const match = lowerText.match(/(?:remind|set\s+reminder)\s+me\s+(?:to\s+)?(.+?)(?:\s+at\s+(.+))?$/i);
    const description = match?.[1] || '';
    const time = match?.[2] || '';
    return {
      intent: 'reminder_create',
      entities: {
        description: description.trim(),
        time: time.trim()
      },
      confidence: 0.7,
    };
  }

  // Navigation intents
  if (lowerText.match(/(?:go\s+to|open|navigate\s+to)\s+(?:the\s+)?(.+?)(?:\s+page)?$/i)) {
    const match = lowerText.match(/(?:go\s+to|open|navigate\s+to)\s+(?:the\s+)?(.+?)(?:\s+page)?$/i);
    let page = match?.[1] || '';
    // Remove trailing "page" if present
    page = page.replace(/\s+page$/i, '').trim();
    return {
      intent: 'navigate',
      entities: { page: page },
      confidence: 0.7,
    };
  }

  // Greeting intents
  if (lowerText.match(/hey\s+lara|hello|hi\s+lara|hi\s+there/i)) {
    return {
      intent: 'general_greeting',
      entities: {},
      confidence: 0.95,
    };
  }

  // Default fallback
  return {
    intent: 'general_unknown',
    entities: {},
    confidence: 0.3,
  };
}





