/**
 * Claude Haiku 4.5 API Endpoint
 * /api/ai/claude-haiku
 * 
 * Enables frontend access to Claude Haiku for:
 * - Intent classification
 * - Text generation
 * - Text analysis
 * - Conversational AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeHaiku, streamClaudeHaiku } from '@/lib/ai/claude-haiku';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 1024,
      stream = false,
    } = body;

    // Validate input
    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    // Stream response if requested
    if (stream) {
      const encoder = new TextEncoder();
      const stream = streamClaudeHaiku(message, {
        systemPrompt,
        temperature,
        maxTokens,
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Regular response
    const response = await callClaudeHaiku(message, {
      systemPrompt,
      temperature,
      maxTokens,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[CLAUDE_HAIKU_API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to process Claude Haiku request',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Claude Haiku 4.5 API',
    endpoint: '/api/ai/claude-haiku',
    methods: ['POST'],
    models: ['claude-3-5-haiku-20241022'],
    features: [
      'Intent classification',
      'Text generation',
      'Text analysis',
      'Conversational AI',
      'Streaming responses',
    ],
  });
}
