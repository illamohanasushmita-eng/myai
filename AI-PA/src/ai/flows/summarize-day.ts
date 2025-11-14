'use server';
/**
 * @fileOverview Summarizes the user's day to provide insights into productivity and areas for improvement.
 *
 * - summarizeDay - A function that takes user's activities and returns a summary of their day.
 * - SummarizeDayInput - The input type for the summarizeDay function.
 * - SummarizeDayOutput - The return type for the summarizeDay function.
 */

import { z } from 'zod';

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
  summary: z
    .string()
    .describe("A summary of the day's activities and achievements."),
  areasForImprovement: z
    .string()
    .describe('Identified areas where the user can improve their productivity.'),
});
export type SummarizeDayOutput = z.infer<typeof SummarizeDayOutputSchema>;

/**
 * Basic, non-LLM implementation of the summarizeDay flow.
 * This keeps type-checking happy without requiring the Genkit runtime.
 */
export async function summarizeDay(
  input: SummarizeDayInput,
): Promise<SummarizeDayOutput> {
  const activitiesSnippet = input.activities.trim().slice(0, 200) || 'your activities';
  const achievementsSnippet =
    input.achievements.trim().slice(0, 200) || 'your achievements';

  const summary = `Today you reported these activities: ${activitiesSnippet}. Key achievements: ${achievementsSnippet}.`;
  const areasForImprovement =
    "Look for patterns where important work was delayed or energy dropped, and adjust tomorrow's schedule to protect your most important tasks.";

  return {
    summary,
    areasForImprovement,
  };
}
