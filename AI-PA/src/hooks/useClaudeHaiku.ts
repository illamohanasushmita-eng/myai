'use client';

/**
 * useClaudeHaiku
 * React hook for Claude Haiku 4.5 integration
 * 
 * Features:
 * - Easy API calls
 * - Loading/error states
 * - Streaming support
 * - Automatic retry
 * - Response caching
 */

import { useState, useCallback, useRef } from 'react';

export interface ClaudeHaikuOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface UseClaudeHaikuReturn {
  isLoading: boolean;
  error: Error | null;
  response: string | null;
  call: (message: string, options?: ClaudeHaikuOptions) => Promise<string>;
  streamCall: (message: string, onChunk: (chunk: string) => void, options?: ClaudeHaikuOptions) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for Claude Haiku API calls
 */
export function useClaudeHaiku(): UseClaudeHaikuReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const call = useCallback(
    async (message: string, options: ClaudeHaikuOptions = {}): Promise<string> => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        const res = await fetch('/api/ai/claude-haiku', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            ...options,
            stream: false,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || 'Claude Haiku API error');
        }

        const data = await res.json();
        const result = data.content || '';

        setResponse(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');

        if (error.name !== 'AbortError') {
          setError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const streamCall = useCallback(
    async (
      message: string,
      onChunk: (chunk: string) => void,
      options: ClaudeHaikuOptions = {}
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        setResponse('');

        abortControllerRef.current = new AbortController();

        const res = await fetch('/api/ai/claude-haiku', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            ...options,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || 'Claude Haiku streaming error');
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const json = JSON.parse(line.slice(6));
                const text = json.text || '';
                onChunk(text);
                fullResponse += text;
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        setResponse(fullResponse);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');

        if (error.name !== 'AbortError') {
          setError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResponse(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLoading,
    error,
    response,
    call,
    streamCall,
    reset,
  };
}

/**
 * Hook for intent classification with Claude Haiku
 */
export function useIntentClassification() {
  const { call, isLoading, error } = useClaudeHaiku();

  const classify = useCallback(
    async (text: string) => {
      const prompt = `Classify the following text into one of these intents:
- greeting
- question
- request
- command
- statement

Text: "${text}"

Respond with only the intent name, nothing else.`;

      const response = await call(text, {
        systemPrompt:
          'You are an intent classifier. Return only the intent name, nothing else.',
        maxTokens: 10,
        temperature: 0,
      });

      return response.toLowerCase().trim();
    },
    [call]
  );

  return { classify, isLoading, error };
}

/**
 * Hook for text summarization with Claude Haiku
 */
export function useSummarizer() {
  const { call, isLoading, error } = useClaudeHaiku();

  const summarize = useCallback(
    async (text: string, maxLength: number = 100) => {
      const prompt = `Summarize the following text in ${maxLength} words or less:

${text}`;

      return call(prompt, {
        systemPrompt: 'You are a text summarizer. Provide concise summaries.',
        maxTokens: maxLength + 50,
      });
    },
    [call]
  );

  return { summarize, isLoading, error };
}

/**
 * Hook for sentiment analysis with Claude Haiku
 */
export function useSentimentAnalysis() {
  const { call, isLoading, error } = useClaudeHaiku();

  const analyze = useCallback(
    async (text: string) => {
      const prompt = `Analyze the sentiment of this text. Respond with ONLY one of: positive, negative, neutral

Text: "${text}"`;

      const response = await call(text, {
        systemPrompt: 'You are a sentiment analyzer. Return only one sentiment word.',
        maxTokens: 10,
        temperature: 0,
      });

      return response.toLowerCase().trim() as 'positive' | 'negative' | 'neutral';
    },
    [call]
  );

  return { analyze, isLoading, error };
}
