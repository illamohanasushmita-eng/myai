import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

/**
 * Speech-to-Text API endpoint
 * Converts audio blob to text using OpenAI Whisper
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI client with server-side environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 },
      );
    }

    console.log(
      "🎤 Received audio file:",
      audioFile.name,
      audioFile.size,
      "bytes",
    );

    // Use OpenAI Whisper to transcribe audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    if (!transcription.text) {
      return NextResponse.json(
        { error: "Failed to transcribe audio" },
        { status: 500 },
      );
    }

    console.log("✅ Transcribed text:", transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
      confidence: 0.95,
    });
  } catch (error) {
    console.error("❌ STT error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
