"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

type DayPoint = { date: string; completed: number };

export default function OverviewGraph() {
  const [loading, setLoading] = useState(true);
  const [tasksByDay, setTasksByDay] = useState<Array<{ date: string; completed: number }>>([]);
  const [projectProgressByDay, setProjectProgressByDay] = useState<Array<{ date: string; percent: number }>>([]);

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, days: 14 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) {
          // Normalize dates to shorter label (MM-DD)
          const tasks = (data.tasksByDay || []).map((d: any) => ({ date: d.date.slice(5), completed: d.completed || 0 }));
          const projects = (data.projectProgressByDay || []).map((d: any) => ({ date: d.date.slice(5), percent: d.percent || 0 }));
          setTasksByDay(tasks);
          setProjectProgressByDay(projects);
        } else {
          console.error("Insights fetch failed", data);
        }
      })
      .catch((err) => console.error("/api/insights error", err))
      .finally(() => setLoading(false));
  }, []);

  // Merge data by date for chart
  const merged = tasksByDay.map((t) => {
    const p = projectProgressByDay.find((x) => x.date === t.date);
    return { date: t.date, completed: t.completed, projectPercent: p ? p.percent : 0 };
  });

  if (loading) return <div className="h-48 flex items-center justify-center">Loading graph...</div>;
  if (!merged.length) return <div className="h-48 flex items-center justify-center">No data yet.</div>;

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Tasks Completed" />
          <Line yAxisId="right" type="monotone" dataKey="projectPercent" stroke="#6366f1" strokeWidth={2} name="Project Progress (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
