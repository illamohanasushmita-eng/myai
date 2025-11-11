import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey,
});

/**
 * Call OpenAI API with optional JSON schema validation
 */
export async function callOpenAI<T = any>(
  prompt: string,
  schema?: any,
  model: string = 'gpt-4-turbo'
): Promise<T> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Always respond with valid JSON when requested.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  if (schema) {
    return JSON.parse(content) as T;
  }

  return content as T;
}

/**
 * Call OpenAI API with structured JSON output
 */
export async function callOpenAIStructured<T = any>(
  prompt: string,
  schema: any,
  model: string = 'gpt-4-turbo'
): Promise<T> {
  return callOpenAI<T>(prompt, schema, model);
}

