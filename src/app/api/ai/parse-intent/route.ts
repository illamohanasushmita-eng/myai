/**
 * Intent Parser API Endpoint
 * Uses OpenAI to parse user commands into structured intents
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const { userText, systemPrompt } = await request.json();

    if (!userText) {
      return NextResponse.json(
        {
          error: 'userText is required',
          intent: { intent: 'GENERAL_QUERY' }
        },
        { status: 400 }
      );
    }

    console.log('📝 Parsing intent for:', userText);

    // Call OpenAI to parse intent
    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || `You are the intent parser for Lara voice assistant.
Read the user command and return JSON ONLY with:
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
- GENERAL_QUERY`,
          },
          {
            role: 'user',
            content: userText,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
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

    const content = response.choices[0]?.message?.content || '{}';
    console.log('📝 OpenAI response:', content);

    // Parse JSON response
    let intent;
    try {
      intent = JSON.parse(content);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          intent = JSON.parse(jsonMatch[0]);
        } catch {
          intent = { intent: 'GENERAL_QUERY' };
        }
      } else {
        intent = { intent: 'GENERAL_QUERY' };
      }
    }

    console.log('✅ Intent parsed:', intent);

    return NextResponse.json({
      success: true,
      intent,
    });
  } catch (error) {
    console.error('❌ Unexpected error in parse-intent:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Intent parsing failed',
        intent: { intent: 'GENERAL_QUERY' }
      },
      { status: 200 } // Return 200 with fallback intent
    );
  }
}

