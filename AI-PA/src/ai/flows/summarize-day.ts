'use server';

/**
 * @fileOverview Summarizes the user's day to provide insights into productivity and areas for improvement.
 *
 * - summarizeDay - A function that takes user's activities and returns a summary of their day.
 * - SummarizeDayInput - The input type for the summarizeDay function.
 * - SummarizeDayOutput - The return type for the summarizeDay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDayInputSchema = z.object({
  activities: z
    .string()
    .describe('A detailed list of activities performed during the day.'),
  achievements: z
    .string()
    .describe('A list of achievements accomplished during the day.'),
});
export type SummarizeDayInput = z.infer<typeof SummarizeDayInputSchema>;

const SummarizeDayOutputSchema = z.object({
  summary: z.string().describe('A summary of the day\'s activities and achievements.'),
  areasForImprovement: z
    .string()
    .describe('Identified areas where the user can improve their productivity.'),
});
export type SummarizeDayOutput = z.infer<typeof SummarizeDayOutputSchema>;

export async function summarizeDay(input: SummarizeDayInput): Promise<SummarizeDayOutput> {
  return summarizeDayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDayPrompt',
  input: {schema: SummarizeDayInputSchema},
  output: {schema: SummarizeDayOutputSchema},
  prompt: `You are an AI assistant designed to summarize a user's day and provide insights for improvement.

  Summarize the user's day based on their activities and achievements. Also, identify potential areas where the user can improve their productivity.

  Activities: {{{activities}}}
  Achievements: {{{achievements}}}
  \n  Summary: \n  Areas for Improvement: `,
});

const summarizeDayFlow = ai.defineFlow(
  {
    name: 'summarizeDayFlow',
    inputSchema: SummarizeDayInputSchema,
    outputSchema: SummarizeDayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
