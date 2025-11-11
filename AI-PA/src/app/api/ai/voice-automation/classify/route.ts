/**
 * Voice Intent Classification API
 * Uses OpenAI to classify voice commands into intents
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const RequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

const IntentSchema = z.object({
  intent: z.enum([
    'play_music',
    'add_task',
    'show_tasks',
    'add_reminder',
    'show_reminders',
    'navigate',
    'general_query',
  ]),
  query: z.string(),
  navigationTarget: z.string().optional(),
  musicQuery: z.string().optional(),
  taskText: z.string().optional(),
  reminderText: z.string().optional(),
  time: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client with server-side environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await request.json();
    const { text } = RequestSchema.parse(body);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that classifies voice commands for a personal assistant application called "Lara".

Analyze the user's voice command and classify it into one of these intents:
- play_music: User wants to play music (e.g., "play a song", "play romantic songs")
- add_task: User wants to add a task (e.g., "add buy groceries to my task list")
- show_tasks: User wants to see their tasks (e.g., "show my tasks", "what are my tasks")
- add_reminder: User wants to set a reminder (e.g., "remind me at 5 PM", "add reminder")
- show_reminders: User wants to see reminders (e.g., "show my reminders")
- navigate: User wants to navigate to a section (e.g., "go to health", "open professional")
- general_query: General questions or queries (e.g., "what's the weather")

Respond with a JSON object containing:
{
  "intent": "<one of the intents above>",
  "query": "<the original command>",
  "navigationTarget": "<if navigate intent, the target page>",
  "musicQuery": "<if play_music intent, what music to search for>",
  "taskText": "<if add_task intent, the task description>",
  "reminderText": "<if add_reminder intent, the reminder text>",
  "time": "<if add_reminder intent, the time if mentioned>",
  "confidence": <0.0 to 1.0 confidence score>
}

Be precise and extract all relevant information from the command. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Classify this command: ${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to classify intent',
        },
        { status: 500 }
      );
    }

    const output = JSON.parse(content);
    const validatedIntent = IntentSchema.parse(output);

    return NextResponse.json({
      success: true,
      intent: validatedIntent,
    });
  } catch (error) {
    console.error('Intent classification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

