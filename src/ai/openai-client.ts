"use server";

import OpenAI from "openai";

export interface DailyPlanOutput {
  morning: string;
  afternoon: string;
  evening: string;
  message: string;
}

/**
 * Generate a personalized daily plan using OpenAI
 */
export async function generatePersonalizedDailyPlan(profile: {
  name?: string;
  preferences?: string;
  pastActivities?: string;
  upcomingDeadlines?: string;
}): Promise<DailyPlanOutput> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are an AI that returns ONLY valid JSON.
Never include commentary, markdown, or explanation.

Return JSON in this exact structure:

{
  "morning": "string",
  "afternoon": "string",
  "evening": "string",
  "message": "string"
}

If any field is missing, fill it with a short string.
`;

    const userPrompt = {
      name: profile.name || "User",
      preferences: profile.preferences || "None",
      pastActivities: profile.pastActivities || "None",
      upcomingDeadlines: profile.upcomingDeadlines || "None",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
      temperature: 0.3,
    });

    let raw = response.choices[0]?.message?.content || "";

    // ✅ Clean JSON output (remove extra text, code blocks, spaces)
    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // ✅ Safe JSON parse
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn("Invalid JSON from OpenAI:", raw);
      throw new Error("Invalid JSON from OpenAI");
    }

    // ✅ Return guaranteed string values (never objects)
    return {
      morning: String(parsed.morning || ""),
      afternoon: String(parsed.afternoon || ""),
      evening: String(parsed.evening || ""),
      message: String(parsed.message || ""),
    };
  } catch (error) {
    console.error("[OPENAI] Error generating daily plan:", error);

    // ✅ Fallback string-only plan
    return {
      morning:
        "Start your day reviewing your priorities and working on your top task.",
      afternoon:
        "Continue work, collaborate with teammates, and handle deadlines.",
      evening: "Wind down, review your day, and prepare for tomorrow.",
      message: "Stay focused and take breaks. You’re doing great!",
    };
  }
}
