import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GL_API_URL = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate";

async function callGenerativeApi(apiKey: string, prompt: string) {
  try {
    const url = `${GL_API_URL}?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 512 }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Generative API error:", resp.status, txt);
      return null;
    }
    const j = await resp.json();
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
    const { userId, days = 14 } = body || {};

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Fetch tasks, reminders, growth goals
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      { data: tasksData, error: tasksError },
      { data: remindersData, error: remindersError },
      { data: growthGoalsData, error: growthError },
    ] = await Promise.all([
      supabaseAdmin
        .from("tasks")
        .select("task_id, user_id, title, status, category, created_at, updated_at")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString()),
      supabaseAdmin
        .from("reminders")
        .select("reminder_id, user_id, title, reminder_time, status, created_at")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString()),
      supabaseAdmin
        .from("growth_goals")
        .select("goal_id, user_id, category, progress_percentage, created_at")
        .eq("user_id", userId),
    ]);

    if (tasksError || remindersError || growthError) {
      console.error("DB errors:", { tasksError, remindersError, growthError });
      return NextResponse.json(
        {
          error: "Failed to fetch user data",
          details: {
            tasksError: tasksError ? { code: tasksError.code, message: tasksError.message } : null,
            remindersError: remindersError ? { code: remindersError.code, message: remindersError.message } : null,
            growthError: growthError ? { code: growthError.code, message: growthError.message } : null,
          },
        },
        { status: 500 },
      );
    }

    const tasks = tasksData || [];
    const reminders = remindersData || [];
    const growthGoals = growthGoalsData || [];

    // Aggregate tasks per day (completed count)
    const tasksByDayMap: Record<string, { date: string; total: number; completed: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      tasksByDayMap[key] = { date: key, total: 0, completed: 0 };
    }

    tasks.forEach((t: any) => {
      // Use updated_at for completed tasks, created_at for others
      const isCompleted = (t.status || "").toLowerCase() === "completed";
      const d = isCompleted ? (t.updated_at || t.created_at) : t.created_at;
      if (!d) return;
      const day = new Date(d).toISOString().slice(0, 10);
      if (!tasksByDayMap[day]) {
        tasksByDayMap[day] = { date: day, total: 0, completed: 0 };
      }
      tasksByDayMap[day].total += 1;
      if (isCompleted) tasksByDayMap[day].completed += 1;
    });

    const tasksByDay = Object.values(tasksByDayMap);

    // Project progress by day: percentage of project-category tasks completed per day
    const projectByDayMap: Record<string, { date: string; total: number; completed: number; percent: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      projectByDayMap[key] = { date: key, total: 0, completed: 0, percent: 0 };
    }

    // Populate project counts
    tasks.forEach((t: any) => {
      if ((t.category || "").toLowerCase() !== "project") return;
      const isCompleted = (t.status || "").toLowerCase() === "completed";
      const d = isCompleted ? (t.updated_at || t.created_at) : t.created_at;
      if (!d) return;
      const day = new Date(d).toISOString().slice(0, 10);
      if (!projectByDayMap[day]) projectByDayMap[day] = { date: day, total: 0, completed: 0, percent: 0 };
      projectByDayMap[day].total += 1;
      if (isCompleted) projectByDayMap[day].completed += 1;
    });

    const projectProgressByDay = Object.values(projectByDayMap).map((v) => ({ date: v.date, percent: v.total ? Math.round((v.completed / v.total) * 100) : 0 }));

    // Reminders: upcoming vs past within range
    const remindersByDayMap: Record<string, { date: string; count: number }> = {};
    reminders.forEach((r: any) => {
      const d = r.reminder_time || r.created_at || null;
      if (!d) return;
      const day = new Date(d).toISOString().slice(0, 10);
      remindersByDayMap[day] = remindersByDayMap[day] || { date: day, count: 0 };
      remindersByDayMap[day].count += 1;
    });
    const remindersByDay = Object.values(remindersByDayMap);

    // Growth summary by category
    const growthByCategory: Record<string, { category: string; avgProgress: number; count: number }> = {};
    growthGoals.forEach((g: any) => {
      const cat = g.category || "other";
      if (!growthByCategory[cat]) growthByCategory[cat] = { category: cat, avgProgress: 0, count: 0 };
      growthByCategory[cat].avgProgress += Number(g.progress_percentage || 0);
      growthByCategory[cat].count += 1;
    });
    const growthSummary = Object.values(growthByCategory).map((v) => ({ category: v.category, avgProgress: v.count ? Math.round(v.avgProgress / v.count) : 0 }));

    // Build prompt for generative insights
    const promptParts: string[] = [];
    promptParts.push(`User insights request for last ${days} days.`);
    promptParts.push(`Tasks: ${tasks.length} total.`);
    promptParts.push(`Reminders: ${reminders.length} total.`);
    if (growthSummary.length) {
      promptParts.push(`Growth categories: ${growthSummary.map((g) => `${g.category} (${g.avgProgress}%)`).join(", ")}`);
    }
    promptParts.push("Provide a JSON object with keys: summary, recommendations, top_improvement_areas. Keep each value concise (under 300 chars). Also provide a small CSV-like series for tasks_by_day with date,count,completed.");

    const prompt = promptParts.join("\n");

    const apiKey = process.env.GEMINI_API_KEY || process.env.GENERATIVE_API_KEY || process.env.OPENAI_API_KEY || null;
    let insightsText: string | null = null;
    if (apiKey) {
      insightsText = await callGenerativeApi(apiKey, prompt);
    }

    let insights: any = null;
    if (insightsText) {
      try {
        insights = JSON.parse(insightsText);
      } catch (err) {
        insights = { summary: "", recommendations: "", top_improvement_areas: [], raw: insightsText };
      }
    } else {
      // Local fallback insights
      const totalCompleted = tasks.reduce((acc: number, t: any) => acc + ((t.status || "").toLowerCase() === "completed" ? 1 : 0), 0);
      const completionRate = tasks.length ? Math.round((totalCompleted / tasks.length) * 100) : 0;
      const summary = `In the last ${days} days you completed ${totalCompleted} of ${tasks.length} tasks (${completionRate}%).`;
      const recommendations = completionRate < 50 ? "Prioritize 2–3 tasks daily and use time-blocking." : "Maintain momentum; try slightly bigger weekly goals.";
      const top_improvement_areas = growthSummary.sort((a, b) => a.avgProgress - b.avgProgress).slice(0, 3).map((g) => g.category);
      insights = { summary, recommendations, top_improvement_areas };
    }

    return NextResponse.json({ success: true, tasksByDay, projectProgressByDay, remindersByDay, growthSummary, insights });
  } catch (err) {
    console.error("/api/insights error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
