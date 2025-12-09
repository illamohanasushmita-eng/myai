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

Input: "add a task to attend the scrum tomorrow"
Output: {"intent": "add_task", "entities": {"title": "attend the scrum tomorrow"}, "confidence": 0.95}

Input: "add task call my mom"
Output: {"intent": "add_task", "entities": {"title": "call my mom"}, "confidence": 0.95}

Input: "play some Telugu songs"
Output: {"intent": "play_music", "entities": {"query": "Telugu songs"}, "confidence": 0.9}

Input: "play a song"
Output: {"intent": "play_music", "entities": {"query": null}, "confidence": 0.95}

Input: "play music"
Output: {"intent": "play_music", "entities": {"query": null}, "confidence": 0.95}

Input: "play prabhas songs"
Output: {"intent": "play_music", "entities": {"query": "prabhas songs"}, "confidence": 0.9}

Input: "play telugu songs"
Output: {"intent": "play_music", "entities": {"query": "telugu songs"}, "confidence": 0.9}

Input: "play hindi music"
Output: {"intent": "play_music", "entities": {"query": "hindi music"}, "confidence": 0.9}

Input: "show my tasks"
Output: {"intent": "show_tasks", "entities": {}, "confidence": 0.95}

Input: "remind me to call mom at 5 PM"
Output: {"intent": "add_reminder", "entities": {"description": "call mom", "time": "5 PM"}, "confidence": 0.9}

Input: "reminder to call my mom tomorrow"
Output: {"intent": "add_reminder", "entities": {"description": "call my mom", "time": "tomorrow"}, "confidence": 0.9}

Input: "set a reminder to call my mom tomorrow"
Output: {"intent": "add_reminder", "entities": {"description": "call my mom", "time": "tomorrow"}, "confidence": 0.9}

Input: "create a reminder for tomorrow to call my mom"
Output: {"intent": "add_reminder", "entities": {"description": "call my mom", "time": "tomorrow"}, "confidence": 0.9}

Input: "add reminder to attend the scrum Tuesday 5:30"
Output: {"intent": "add_reminder", "entities": {"description": "attend the scrum", "time": "Tuesday 5:30"}, "confidence": 0.95}

Input: "add a reminder to buy groceries tomorrow"
Output: {"intent": "add_reminder", "entities": {"description": "buy groceries", "time": "tomorrow"}, "confidence": 0.95}

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

  // Music playback intents - comprehensive pattern matching
  // Patterns: "play a song", "play music", "play telugu songs", "play prabhas songs", "play [song/artist]"

  // Pattern 1: Generic music requests ("play a song", "play music", "play some music")
  if (lowerText.match(/^play\s+(?:a\s+)?(?:song|music|some\s+music|some\s+songs?)$/i)) {
    console.log('🎵 [COHERE] Generic music request detected');
    return {
      intent: 'play_music',
      entities: { query: null }, // No specific query
      confidence: 0.85,
    };
  }

  // Pattern 2: Genre/Language/Mood based ("play telugu songs", "play hindi music", "play relaxing music")
  if (lowerText.match(/^play\s+(?:some\s+)?(.+?)\s+(?:songs?|music)$/i)) {
    const match = lowerText.match(/^play\s+(?:some\s+)?(.+?)\s+(?:songs?|music)$/i);
    const query = match?.[1]?.trim() || '';

    // Check if it's a language, genre, or mood
    const musicKeywords = ['telugu', 'hindi', 'tamil', 'kannada', 'malayalam', 'punjabi', 'marathi', 'gujarati', 'bengali', 'urdu', 'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'japanese', 'korean', 'chinese', 'arabic', 'relaxing', 'energetic', 'sad', 'happy', 'romantic', 'party', 'workout', 'sleep', 'focus', 'study', 'chill', 'upbeat', 'mellow', 'acoustic', 'electronic', 'rock', 'pop', 'jazz', 'classical', 'blues', 'country', 'reggae', 'hip-hop', 'rap', 'metal', 'indie', 'folk', 'soul', 'r&b', 'rnb', 'disco', 'funk', 'gospel', 'ambient', 'lo-fi', 'lofi'];

    if (query && musicKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      console.log(`🎵 [COHERE] Music genre/language/mood detected: ${query}`);
      return {
        intent: 'play_music',
        entities: { query: query },
        confidence: 0.85,
      };
    }
  }

  // Pattern 3: Specific song/artist ("play prabhas songs", "play [song name]", "play songs by [artist]")
  if (lowerText.match(/^play\s+(?:me\s+)?(.+?)(?:\s+(?:song|music|track|songs|by))?s?$/i)) {
    const match = lowerText.match(/^play\s+(?:me\s+)?(.+?)(?:\s+(?:song|music|track|songs|by))?s?$/i);
    let query = match?.[1] || '';

    // Clean up the query
    query = query.replace(/\s+(?:song|music|track|songs|by)s?$/i, '').trim();

    if (query && query.length > 1 && !['a', 'song', 'music', 'track', 'a song', 'a music', 'a track'].includes(query.toLowerCase())) {
      console.log(`🎵 [COHERE] Specific music query detected: ${query}`);
      return {
        intent: 'play_music',
        entities: { query: query },
        confidence: 0.8,
      };
    }
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
  // Matches patterns like:
  // - "remind me to call my mom tomorrow"
  // - "reminder to call my mom tomorrow"
  // - "set a reminder to call my mom tomorrow"
  // - "create a reminder for tomorrow to call my mom"
  // - "add reminder to attend scrum"
  // - "add a reminder to call my mom"
  // - "remind me to call my mom at 5:30"
  // - "set reminder me to call my mom tomorrow at 5:30"
  if (lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)/i)) {
    let description = '';
    let time = '';

    // Pattern 1: "remind me to X at TIME" or "reminder to X at TIME" or "add reminder to X at TIME"
    const atMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)\s+(?:me\s+)?(?:to\s+)?(.+?)\s+at\s+(.+)$/i);
    if (atMatch) {
      description = atMatch[1];
      time = atMatch[2];
    } else {
      // Pattern 2: "remind me to X, TIME" or "reminder to X, TIME" or "add reminder to X, TIME"
      const commaMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)\s+(?:me\s+)?(?:to\s+)?(.+?),\s*(.+)$/i);
      if (commaMatch) {
        description = commaMatch[1];
        time = commaMatch[2];
      } else {
        // Pattern 3: "create a reminder for TIME to X" or "add reminder for TIME to X"
        const forMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder|set\s+(?:a\s+)?reminder)\s+for\s+(.+?)\s+to\s+(.+)$/i);
        if (forMatch) {
          time = forMatch[1];
          description = forMatch[2];
        } else {
          // Pattern 4a: "remind me to X DAY TIME" (e.g., "attend the scrum tuesday 5:30")
          // This pattern specifically handles day name followed by time
          const dayTimeMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)\s+(?:me\s+)?(?:to\s+)?(.+?)\s+((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$/i);
          if (dayTimeMatch) {
            description = dayTimeMatch[1];
            time = dayTimeMatch[2] + ' ' + dayTimeMatch[3]; // "tuesday 5:30"
          } else {
            // Pattern 4b: "remind me to X TIME" or "reminder to X TIME" or "add reminder to X TIME" (with time at end)
            // This regex matches:
            // - "tomorrow", "today", "tonight"
            // - Day names: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
            // - "next [word]"
            // - Time patterns: "5:30", "5:00 pm", etc.
            const timePatternMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)\s+(?:me\s+)?(?:to\s+)?(.+?)\s+((?:tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+\w+|\d{1,2}(?::\d{2})?\s*(?:am|pm)?))$/i);
            if (timePatternMatch) {
              description = timePatternMatch[1];
              time = timePatternMatch[2];
            } else {
              // Pattern 5: Fallback - just extract everything after the reminder keyword
              const fallbackMatch = lowerText.match(/(?:add\s+(?:a\s+)?reminder|remind|reminder|set\s+(?:a\s+)?reminder|create\s+(?:a\s+)?reminder)\s+(?:me\s+)?(?:to\s+)?(.+)$/i);
              if (fallbackMatch) {
                description = fallbackMatch[1];
                time = '';
              }
            }
          }
        }
      }
    }

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





