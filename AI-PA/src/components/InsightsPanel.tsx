"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

type TasksByDay = { date: string; total: number; completed: number };
type ProjectProgressByDay = { date: string; percent: number };
type GrowthSummary = { category: string; avgProgress: number };

export default function InsightsPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksByDay, setTasksByDay] = useState<TasksByDay[]>([]);
  const [projectProgressByDay, setProjectProgressByDay] = useState<ProjectProgressByDay[]>([]);
  const [growthSummary, setGrowthSummary] = useState<GrowthSummary[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, days: 14 }),
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`API returned ${r.status}: ${r.statusText}`);
        }
        return r.json();
      })
      .then((data) => {
        if (data?.success) {
          setTasksByDay(data.tasksByDay || []);
          setProjectProgressByDay(data.projectProgressByDay || []);
          setGrowthSummary(data.growthSummary || []);
          setInsights(data.insights || null);
          setError(null);
        } else {
          console.error("Insights fetch failed", data);
          setError(data.error || "Failed to load insights");
        }
      })
      .catch((err) => {
        console.error("/api/insights error", err);
        setError("Unable to connect to server. Please check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <div className="p-4 text-gray-600">Sign in to see insights.</div>;

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Unable to Load Insights
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalTasks = tasksByDay.reduce((sum, d) => sum + d.total, 0);
  const completedTasks = tasksByDay.reduce((sum, d) => sum + d.completed, 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const avgProjectProgress = projectProgressByDay.length > 0
    ? Math.round(projectProgressByDay.reduce((sum, d) => sum + d.percent, 0) / projectProgressByDay.length)
    : 0;

  const avgGoalProgress = growthSummary.length > 0
    ? Math.round(growthSummary.reduce((sum, g) => sum + g.avgProgress, 0) / growthSummary.length)
    : 0;

  // Merge data for unified chart - show last 7 days for better readability
  const mergedData = tasksByDay.slice(-7).map((t) => {
    const project = projectProgressByDay.find((p) => p.date === t.date);
    const completionPercent = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;

    return {
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: completionPercent,
      projects: project ? project.percent : 0,
      goals: avgGoalProgress, // Goals are overall, not daily
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✓</span>
            <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800 px-2 py-1 rounded-full">
              Tasks
            </span>
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{taskCompletionRate}%</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {completedTasks}/{totalTasks} completed
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
              Projects
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{avgProjectProgress}%</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Average progress</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded-full">
              Goals
            </span>
          </div>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{avgGoalProgress}%</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {growthSummary.length} active {growthSummary.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
      </div>

      {/* Unified Progress Chart */}
      <div className="bg-white/70 dark:bg-gray-800/70 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
          Weekly Progress Overview (Last 7 Days)
        </h3>
        {mergedData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-4xl mb-2">📊</p>
              <p>No data available yet</p>
              <p className="text-sm mt-1">Start completing tasks to see your progress!</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mergedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'Completion %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend
                wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="tasks" fill="#10b981" name="Tasks Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projects" fill="#3b82f6" name="Project Progress" radius={[4, 4, 0, 0]} />
              <Bar dataKey="goals" fill="#8b5cf6" name="Goal Progress" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">AI Insights</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                {insights.summary || "Keep up the great work!"}
              </p>
              {insights.recommendations && (
                <>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">💪 Recommendations:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insights.recommendations}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
