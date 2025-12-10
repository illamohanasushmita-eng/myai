"use server";
/**
 * @fileOverview Flow for suggesting personalized improvements to a user's daily plan.
 *
 * - suggestImprovements - A function that suggests improvements to the daily plan.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SuggestImprovementsInputSchema = z.object({
  dailyPlan: z.string().describe("The user's current daily plan."),
  pastPerformance: z
    .string()
    .describe("A summary of the user's past performance and habits."),
  deadlines: z.string().describe("A list of the user's upcoming deadlines."),
});
export type SuggestImprovementsInput = z.infer<
  typeof SuggestImprovementsInputSchema
>;

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
    .describe("Whether the suggestion is well suited to the specific context."),
});
export type SuggestImprovementsOutput = z.infer<
  typeof SuggestImprovementsOutputSchema
>;

export async function suggestImprovements(
  input: SuggestImprovementsInput,
): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestImprovementsPrompt",
  input: { schema: SuggestImprovementsInputSchema },
  output: { schema: SuggestImprovementsOutputSchema },
  prompt: `You are an AI assistant designed to help users optimize their daily plans for maximum productivity.

  Based on the user\'s current daily plan, past performance, habits, and upcoming deadlines, provide personalized suggestions for improvement.

  Consider factors such as time management, task prioritization, and potential conflicts.

  Reason about the suitability of the suggestion for the user's specific situation, and set the isWellSuited field appropriately.

  Current Daily Plan: {{{dailyPlan}}}
  Past Performance and Habits: {{{pastPerformance}}}
  Upcoming Deadlines: {{{deadlines}}}

  Provide your suggestions in a clear and concise manner.
  Format your output as a JSON object:
  {{outputFormat schema=SuggestImprovementsOutputSchema}}
  `,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: "suggestImprovementsFlow",
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
