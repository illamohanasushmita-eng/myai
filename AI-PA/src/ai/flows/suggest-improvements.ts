'use server';
/**
 * @fileOverview Flow for suggesting personalized improvements to a user's daily plan.
 *
 * - suggestImprovements - A function that suggests improvements to the daily plan.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import { z } from 'zod';

const SuggestImprovementsInputSchema = z.object({
  dailyPlan: z.string().describe("The user's current daily plan."),
  pastPerformance: z
    .string()
    .describe("A summary of the user's past performance and habits."),
  deadlines: z.string().describe("A list of the user's upcoming deadlines."),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  improvements: z
    .string()
    .describe(
      "A list of personalized suggestions for improving the user's daily plan.",
    ),
  reasoning: z
    .string()
    .describe(
      "The AI's reasoning for suggesting the improvements, based on the user's past performance, habits, and deadlines.",
    ),
  isWellSuited: z
    .boolean()
    .describe('Whether the suggestion is well suited to the specific context.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

/**
 * Basic, non-LLM implementation of the suggestImprovements flow.
 * This keeps type-checking happy without requiring the Genkit runtime.
 */
export async function suggestImprovements(
  input: SuggestImprovementsInput,
): Promise<SuggestImprovementsOutput> {
  const planSnippet = input.dailyPlan.trim().slice(0, 200) || 'your current plan';

  const improvements =
    `Based on your current plan ("${planSnippet}"), consider prioritizing your most important tasks earlier in the day, grouping similar tasks together, and reserving focused blocks for deep work.`;
  const reasoning =
    'This is a default suggestion to keep the feature working without the Genkit runtime. You can later replace this implementation with a call to your preferred LLM.';

  return {
    improvements,
    reasoning,
    isWellSuited: true,
  };
}
