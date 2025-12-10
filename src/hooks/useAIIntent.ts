"use client";

import { useState, useCallback } from "react";

export interface IntentResult {
  mood: string | null;
  hero: string | null;
  timeContext: string | null;
  language: string | null;
  playlistQuery: string;
  confidence: number;
}

export function useAIIntent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<IntentResult | null>(null);

  const detectIntent = useCallback(
    async (text: string, userId: string): Promise<IntentResult | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/ai/intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to detect intent");
        }

        const data = await response.json();
        setIntent(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setIntent(null);
    setError(null);
  }, []);

  return {
    intent,
    loading,
    error,
    detectIntent,
    reset,
  };
}
