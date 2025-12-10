import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/ai/openai";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * POST /api/ai/transcribe
 * Transcribes audio file to text using OpenAI Whisper API
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 },
      );
    }

    console.log(
      "🎤 Received audio file:",
      audioFile.name,
      audioFile.size,
      "bytes",
    );

    // Convert File to Buffer
    const buffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, uint8Array);

    try {
      // Transcribe using OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
      });

      console.log("✅ Transcribed text:", transcription.text);

      return NextResponse.json({
        success: true,
        text: transcription.text,
        confidence: 0.95, // Whisper doesn't provide confidence scores
      });
    } finally {
      // Cleanup temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    console.error("❌ Transcription error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Transcription failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
