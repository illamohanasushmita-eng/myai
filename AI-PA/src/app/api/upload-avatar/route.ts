import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fileName, base64 } = body;

    if (!userId || !base64 || !fileName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // base64 looks like data:<mime>;base64,<data>
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid base64 data" }, { status: 400 });
    }

    const mime = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    const filePath = `profiles/${userId}_${Date.now()}_${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.error("[API-upload-avatar] uploadError:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData, error: publicUrlError } = await supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (publicUrlError) {
      console.warn("[API-upload-avatar] getPublicUrl error:", publicUrlError);
    }

    const publicUrl = publicUrlData?.publicUrl || null;

    // Optionally update the users table with the avatar_url using service role
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("user_id", userId);

    if (updateError) {
      console.warn("[API-upload-avatar] failed to update users table:", updateError);
      // Not fatal — return the publicUrl anyway
    }

    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error("[API-upload-avatar] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
