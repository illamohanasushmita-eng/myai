import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/ai/openai';
import { z } from 'zod';

const RequestSchema = z.object({
  userMessage: z.string().min(1, 'Message is required'),
  userId: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

/**
 * POST /api/ai/voice-chat
 * Processes voice chat messages and returns AI response
 * Designed for real-time voice conversation with Lara
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, userId, conversationHistory } = RequestSchema.parse(body);

    console.log('💬 Voice chat message:', userMessage);

    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `You are Lara, a helpful, intelligent, and emotionally aware personal voice assistant. 
You are designed to have natural conversations with users through voice.
Keep your responses concise and conversational (1-3 sentences typically).
Be friendly, supportive, and proactive in helping the user.
When appropriate, offer to help with tasks, reminders, music, or navigation.`,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Get response from OpenAI
    const response = await callOpenAI(
      messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
      null,
      'gpt-4-turbo'
    );

    if (!response) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate response',
        },
        { status: 500 }
      );
    }

    console.log('✅ Lara response:', response);

    return NextResponse.json({
      success: true,
      message: response,
      userId: userId,
    });
  } catch (error) {
    console.error('❌ Voice chat error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Voice chat failed';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

