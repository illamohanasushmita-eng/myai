import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { searchSpotifyTracks } from "@/lib/spotify/search";
import { getCurrentTimeContext } from "@/lib/ai/intent-detector";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { userId, triggerType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (prefError) {
      return NextResponse.json(
        { error: "User preferences not found" },
        { status: 404 },
      );
    }

    // Get active automation rules
    const { data: rules, error: rulesError } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (rulesError) {
      return NextResponse.json(
        { error: "Failed to fetch automation rules" },
        { status: 500 },
      );
    }

    // Determine trigger type if not provided
    let trigger = triggerType;
    if (!trigger) {
      const currentHour = new Date().getHours();
      if (currentHour >= 22 || currentHour < 6) {
        trigger = "night";
      }
    }

    // Find matching rules
    const matchingRules = rules.filter((rule) => rule.trigger_type === trigger);

    if (matchingRules.length === 0) {
      return NextResponse.json({
        triggered: false,
        message: "No matching automation rules",
      });
    }

    // Get recommendations based on first matching rule
    const rule = matchingRules[0];
    const tracks = await searchSpotifyTracks(rule.playlist_query, userId, 20);

    return NextResponse.json({
      triggered: true,
      triggerType: trigger,
      rule: {
        id: rule.id,
        playlistQuery: rule.playlist_query,
      },
      recommendations: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name,
        album: track.album.name,
        image: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
      })),
    });
  } catch (error) {
    console.error("Error triggering automation:", error);
    return NextResponse.json(
      { error: "Failed to trigger automation" },
      { status: 500 },
    );
  }
}
