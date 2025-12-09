/**
 * Intent Parser API Endpoint
 * Uses OpenAI to parse user commands into structured intents
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, userText, userId } = await request.json();

    // Support both 'text' and 'userText' parameter names
    const inputText = text || userText;

    if (!inputText) {
      return NextResponse.json(
        {
          error: 'Text is required',
          intent: { intent: 'GENERAL_QUERY' }
        },
        { status: 400 }
      );
    }

    console.log('📝 Parsing intent for:', inputText);

    // GPT Intent Extraction
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Lara's intent parser. Return STRICT JSON ONLY with this structure:
{
  "intent": "",
  "pageName": "",
  "songName": "",
  "artistName": ""
}

Supported intents:
- PLAY_SONG
- OPEN_TASKS_PAGE
- OPEN_ADD_TASK_PAGE
- OPEN_REMINDERS_PAGE
- OPEN_ADD_REMINDER_PAGE
- OPEN_HOME_PAGE
- OPEN_PROFESSIONAL_PAGE
- OPEN_PERSONAL_GROWTH_PAGE
- GENERAL_QUERY

Extract correct fields:
- songName (for PLAY_SONG intent)
- pageName (for OPEN_*_PAGE intents)
- artistName (optional, for PLAY_SONG intent)`
          },
          {
            role: 'user',
            content: inputText
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
    } catch (apiError: any) {
      console.error('❌ OpenAI API error:', apiError?.message || apiError);

      // Check for specific API errors
      if (apiError?.status === 401) {
        console.error('Invalid OpenAI API key');
        return NextResponse.json(
          {
            error: 'Invalid OpenAI API key',
            intent: { intent: 'GENERAL_QUERY' }
          },
          { status: 401 }
        );
      } else if (apiError?.status === 429) {
        console.error('OpenAI rate limit exceeded');
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            intent: { intent: 'GENERAL_QUERY' }
          },
          { status: 429 }
        );
      } else if (apiError?.status === 500) {
        console.error('OpenAI server error');
        return NextResponse.json(
          {
            error: 'OpenAI service error. Please try again.',
            intent: { intent: 'GENERAL_QUERY' }
          },
          { status: 503 }
        );
      }

      // Generic API error - return fallback
      return NextResponse.json(
        {
          error: 'Failed to parse intent',
          intent: { intent: 'GENERAL_QUERY' }
        },
        { status: 200 } // Return 200 with fallback intent
      );
    }

    const content = completion.choices[0]?.message?.content || '{}';
    console.log('📝 OpenAI response:', content);

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = { intent: 'GENERAL_QUERY' };
        }
      } else {
        parsed = { intent: 'GENERAL_QUERY' };
      }
    }

    console.log('✅ Intent parsed:', parsed);

    return NextResponse.json({
      success: true,
      intent: parsed
    });

  } catch (error) {
    console.error('❌ Unexpected error in intent parser:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Intent parsing failed',
        intent: { intent: 'GENERAL_QUERY' }
      },
      { status: 200 } // Return 200 with fallback intent
    );
  }
}
