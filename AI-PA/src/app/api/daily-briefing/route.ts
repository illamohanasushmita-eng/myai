import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GL_API_URL = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate";

async function callGenerativeApi(apiKey: string, prompt: string) {
  try {
    const url = `${GL_API_URL}?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.2,
        maxOutputTokens: 512,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Generative API error:", resp.status, txt);
      return null;
    }
    const j = await resp.json();
    // text-bison style response: j.candidates[0].output
    const text = j?.candidates?.[0]?.output || j?.output?.[0]?.content || null;
    return text;
  } catch (err) {
    console.error("callGenerativeApi error:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body || {};

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Fetch user profile, tasks, reminders from Supabase using service role
    const [{ data: user }, { data: tasks }, { data: reminders }] = await Promise.all([
      supabaseAdmin.from("users").select("*").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("tasks").select("title,description,due_date,status").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
      supabaseAdmin.from("reminders").select("title,reminder_time,reminder_type").eq("user_id", userId).order("reminder_time", { ascending: true }).limit(6),
    ]);

    const profile = user || null;

    // Build a simple context string
    const parts: string[] = [];
    if (profile) parts.push(`User name: ${profile.name || "User"}. Email: ${profile.email || "unknown"}.`);
    if (tasks && tasks.length) {
      parts.push("Recent tasks:");
      tasks.forEach((t: any, i: number) => {
        parts.push(`${i + 1}. ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""} - ${t.status || "unknown"}`);
      });
    }
    if (reminders && reminders.length) {
      parts.push("Upcoming reminders:");
      reminders.forEach((r: any, i: number) => {
        parts.push(`${i + 1}. ${r.title} at ${r.reminder_time || "unknown"}`);
      });
    }

    const contextText = parts.join("\n");

    const prompt = `Create a short Daily Briefing for the user based on the following context. Produce JSON with keys: morning, afternoon, evening, message. Keep each value under 200 characters. Context:\n${contextText}`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GENERATIVE_API_KEY || process.env.OPENAI_API_KEY || null;

    let resultText: string | null = null;
    if (apiKey) {
      resultText = await callGenerativeApi(apiKey, prompt);
    }

    // If external call failed or no key, produce a simple local summary
    if (!resultText) {
      const morning = profile ? `Good morning ${profile.name || "there"}. Focus on your top task: ${tasks?.[0]?.title || "No top task"}.` : "Good morning — check your tasks for priority items.";
      const afternoon = profile ? `In the afternoon, consider following up on: ${tasks?.[1]?.title || "collaboration"}.` : "Afternoon — take a short walk and refocus.";
      const evening = profile ? `Evening: review progress, mark completed tasks, and plan tomorrow.` : "Evening: relax and review your day.";
      const message = profile ? `You're on track. Keep momentum and hydrate!` : "Have a productive day!";

      return NextResponse.json({ morning, afternoon, evening, message });
    }

    // Try to parse JSON returned by model
    try {
      // Some models may return plain text; try to extract JSON object
      const parsed = JSON.parse(resultText);
      return NextResponse.json(parsed);
    } catch (err) {
      // If not JSON, return raw text in message
      return NextResponse.json({ morning: "", afternoon: "", evening: "", message: resultText });
    }
  } catch (err) {
    console.error("/api/daily-briefing error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
