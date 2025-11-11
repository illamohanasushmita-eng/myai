import { z } from 'zod';
import { openai } from '@/ai/openai-client';

// Strict JSON schema for intent classification
export const IntentSchema = z.object({
  intent: z.enum([
    'play_music',
    'add_task',
    'show_tasks',
    'add_reminder',
    'show_reminders',
    'navigate',
    'general_query',
  ]),
  query: z.string().nullable(),
  taskText: z.string().nullable(),
  musicQuery: z.string().nullable(),
  navigationTarget: z.enum(['/tasks', '/reminders']).nullable(),
  time: z.string().nullable(),
});

export type Intent = z.infer<typeof IntentSchema>;

export async function classifyIntent(text: string): Promise<Intent> {
  try {
    console.log('🎤 Classifying intent for:', text);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an intent classifier for a voice assistant. Analyze the user's command and return STRICT JSON.

Return ONLY valid JSON matching this schema:
{
  "intent": "play_music" | "add_task" | "show_tasks" | "add_reminder" | "show_reminders" | "navigate" | "general_query",
  "query": string or null,
  "taskText": string or null,
  "musicQuery": string or null,
  "navigationTarget": "/tasks" | "/reminders" | null,
  "time": string or null
}

Rules:
1. If user wants to play music: intent="play_music", set musicQuery
2. If user wants to add a task: intent="add_task", set taskText
3. If user wants to see tasks: intent="show_tasks", set navigationTarget="/tasks"
4. If user wants to add a reminder: intent="add_reminder", set taskText and time if mentioned
5. If user wants to see reminders: intent="show_reminders", set navigationTarget="/reminders"
6. If user wants to navigate: intent="navigate", set navigationTarget
7. Otherwise: intent="general_query", set query

Be precise. Return ONLY the JSON object, no other text.`,
        },
        {
          role: 'user',
          content: `Classify this command: ${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to classify intent');
    }

    // Parse the JSON response
    const output = JSON.parse(content);

    // Validate the output matches our schema
    const validatedIntent = IntentSchema.parse(output);
    console.log('✅ Intent classified:', validatedIntent);

    return validatedIntent;
  } catch (error) {
    console.error('❌ Error classifying intent:', error);
    throw error;
  }
}

