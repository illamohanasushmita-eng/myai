import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  VoiceCommandIntentSchema,
  VoiceCommandResponse,
} from "@/lib/ai/voice-command";

const RequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client with server-side environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await request.json();
    const { text, userId } = RequestSchema.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that processes voice commands for a personal assistant application.

Analyze the user's voice command and determine their intent. The application has the following features:
- Tasks management (show, add, edit, delete tasks)
- Reminders (show, add, edit reminders)
- Schedule viewing
- Health data display
- Professional section (work, projects, meetings)
- Home section (chores, family, pets)
- Personal growth section (learning, habits, goals)
- Spotify music player (play music, search songs)

Determine the user's intent and provide a JSON response with:
1. intent: The primary intent (show_tasks, add_task, show_reminders, add_reminder, show_schedule, show_health, show_professional, show_home, show_growth, play_music, navigate, or unknown)
2. action: A clear description of what action to take
3. parameters: Any relevant parameters extracted from the command (e.g., task title, reminder time, music query)
4. confidence: A confidence score from 0 to 1 indicating how confident you are about the intent
5. message: A user-friendly message confirming the action

Be concise and accurate. If the intent is unclear, set confidence to a lower value and suggest the most likely intent. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Process this voice command: ${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process voice command",
        },
        { status: 500 },
      );
    }

    const output = JSON.parse(content);
    const validatedIntent = VoiceCommandIntentSchema.parse(output);

    const voiceResponse: VoiceCommandResponse = {
      success: true,
      transcribedText: text,
      intent: validatedIntent,
    };

    return NextResponse.json(voiceResponse);
  } catch (error) {
    console.error("Voice command error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process voice command",
      },
      { status: 500 },
    );
  }
}
