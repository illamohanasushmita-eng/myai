/**
 * LLM Provider Configuration
 * Supports: OpenAI, Cohere, Anthropic Claude
 * Default: Claude Haiku 4.5 for all clients
 */

export type LLMProvider = 'openai' | 'cohere' | 'anthropic' | 'claude-haiku';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  enabled: boolean;
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
  tokensUsed?: number;
}

/**
 * Get active LLM configuration
 */
export function getLLMConfig(): LLMConfig {
  const provider = (process.env.NEXT_PUBLIC_DEFAULT_LLM_PROVIDER || 'claude-haiku') as LLMProvider;
  const enabled = process.env.NEXT_PUBLIC_LLM_ENABLED !== 'false';

  switch (provider) {
    case 'claude-haiku':
    case 'anthropic':
      return {
        provider: 'claude-haiku',
        model: 'claude-3-5-haiku-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        enabled,
      };

    case 'openai':
      return {
        provider: 'openai',
        model: 'gpt-4-turbo',
        apiKey: process.env.OPENAI_API_KEY || '',
        enabled,
      };

    case 'cohere':
      return {
        provider: 'cohere',
        model: 'command-r-plus',
        apiKey: process.env.COHERE_API_KEY || '',
        enabled,
      };

    default:
      return {
        provider: 'claude-haiku',
        model: 'claude-3-5-haiku-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        enabled,
      };
  }
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): { valid: boolean; error?: string } {
  if (!config.enabled) {
    return { valid: false, error: 'LLM provider is disabled' };
  }

  if (!config.apiKey) {
    return {
      valid: false,
      error: `Missing API key for ${config.provider}. Set ${
        config.provider === 'claude-haiku' || config.provider === 'anthropic'
          ? 'ANTHROPIC_API_KEY'
          : config.provider === 'openai'
            ? 'OPENAI_API_KEY'
            : 'COHERE_API_KEY'
      } in .env.local`,
    };
  }

  return { valid: true };
}

/**
 * Call LLM with automatic provider selection
 */
export async function callLLM(
  messages: LLMMessage[],
  options?: {
    provider?: LLMProvider;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<LLMResponse> {
  const config = getLLMConfig();

  if (options?.provider) {
    config.provider = options.provider;
  }

  const validation = validateLLMConfig(config);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  switch (config.provider) {
    case 'claude-haiku':
    case 'anthropic':
      return callClaudeHaiku(messages, config, options);
    case 'openai':
      return callOpenAI(messages, config, options);
    case 'cohere':
      return callCohere(messages, config, options);
    default:
      throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}

/**
 * Call Claude Haiku 4.5
 */
async function callClaudeHaiku(
  messages: LLMMessage[],
  config: LLMConfig,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    return {
      content,
      model: config.model,
      provider: 'claude-haiku',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  } catch (error) {
    throw new Error(`Claude Haiku 4.5 error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call OpenAI GPT-4
 */
async function callOpenAI(
  messages: LLMMessage[],
  config: LLMConfig,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return {
      content,
      model: config.model,
      provider: 'openai',
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    throw new Error(`OpenAI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call Cohere
 */
async function callCohere(
  messages: LLMMessage[],
  config: LLMConfig,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  try {
    const response = await fetch('https://api.cohere.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        prompt: messages.map(m => m.content).join('\n'),
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.generations[0]?.text || '';

    return {
      content,
      model: config.model,
      provider: 'cohere',
    };
  } catch (error) {
    throw new Error(`Cohere error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format LLM response for UI
 */
export function formatLLMResponse(response: LLMResponse): string {
  return `${response.content}`;
}

/**
 * Create system message for Claude Haiku
 */
export function createSystemMessage(
  role: string,
  context?: string
): LLMMessage {
  return {
    role: 'system',
    content: `You are a helpful AI assistant${role ? ` helping with ${role}` : ''}${
      context ? `. Context: ${context}` : ''
    }. Provide clear, concise responses.`,
  };
}

/**
 * Format conversation for LLM
 */
export function formatConversation(
  userMessage: string,
  systemContext?: string
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  if (systemContext) {
    messages.push(createSystemMessage('general', systemContext));
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  return messages;
}
