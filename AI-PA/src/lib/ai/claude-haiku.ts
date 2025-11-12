/**
 * Claude Haiku 4.5 Client
 * Simplified wrapper for Claude Haiku API calls
 * Available for all clients (browser and server-side)
 */

import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Claude client (server-side only)
const apiKey = process.env.ANTHROPIC_API_KEY;

export interface ClaudeHaikuOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ClaudeHaikuResponse {
  content: string;
  model: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Call Claude Haiku 4.5 directly
 * This is the primary LLM for all features
 */
export async function callClaudeHaiku(
  userMessage: string,
  options: ClaudeHaikuOptions = {}
): Promise<ClaudeHaikuResponse> {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set. Add it to .env.local');
  }

  try {
    const client = new Anthropic({
      apiKey,
    });

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      system: options.systemPrompt || 'You are a helpful AI assistant. Provide clear and concise responses.',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content =
      response.content[0].type === 'text'
        ? response.content[0].text
        : 'No response generated';

    return {
      content,
      model: 'claude-3-5-haiku-20241022',
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Claude Haiku 4.5 error: ${errorMessage}`);
  }
}

/**
 * Stream Claude Haiku response
 * Real-time streaming for better UX
 */
export async function* streamClaudeHaiku(
  userMessage: string,
  options: ClaudeHaikuOptions = {}
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  try {
    const client = new Anthropic({
      apiKey,
    });

    const stream = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
      system: options.systemPrompt || 'You are a helpful AI assistant.',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Claude Haiku 4.5 streaming error: ${errorMessage}`);
  }
}

/**
 * Generate text using Claude Haiku
 * Common use case wrapper
 */
export async function generateWithClaudeHaiku(
  prompt: string,
  context?: string,
  maxTokens?: number
): Promise<string> {
  const systemPrompt = context
    ? `${context}\n\nProvide clear and concise responses.`
    : 'You are a helpful AI assistant. Provide clear and concise responses.';

  try {
    const response = await callClaudeHaiku(prompt, {
      systemPrompt,
      maxTokens: maxTokens || 1024,
    });

    return response.content;
  } catch (error) {
    throw error;
  }
}

/**
 * Analyze text using Claude Haiku
 * Perfect for text analysis, summarization, classification
 */
export async function analyzeWithClaudeHaiku(
  text: string,
  analysisType: 'summarize' | 'sentiment' | 'classify' | 'extract' = 'summarize',
  context?: string
): Promise<string> {
  const prompts: Record<string, (t: string, c?: string) => string> = {
    summarize: (t, c) =>
      `Summarize the following text concisely${c ? `, focusing on ${c}` : ''}:\n\n${t}`,
    sentiment: (t) =>
      `Analyze the sentiment of this text and provide a brief explanation:\n\n${t}`,
    classify: (t, c) =>
      `Classify this text into categories${c ? ` (${c})` : ''}:\n\n${t}`,
    extract: (t, c) =>
      `Extract key information${c ? ` (${c})` : ''} from this text:\n\n${t}`,
  };

  const prompt = prompts[analysisType]?.(text, context) || prompts.summarize(text, context);

  return generateWithClaudeHaiku(prompt);
}

/**
 * Check if Claude Haiku is configured and available
 */
export function isClaudeHaikuConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Get Claude Haiku configuration status
 */
export function getClaudeHaikuStatus(): {
  configured: boolean;
  apiKey: string;
  model: string;
  enabled: boolean;
} {
  return {
    configured: isClaudeHaikuConfigured(),
    apiKey: apiKey ? '***configured***' : '***not configured***',
    model: 'claude-3-5-haiku-20241022',
    enabled: process.env.NEXT_PUBLIC_LLM_ENABLED !== 'false',
  };
}
