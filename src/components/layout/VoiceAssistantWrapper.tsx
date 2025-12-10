"use client";

import { useEffect, useState } from "react";
import { VoiceCommandButton } from "@/components/voice/VoiceCommandButton";

/**
 * VoiceAssistantWrapper Component
 *
 * This component wraps the VoiceCommandButton and provides:
 * - Fixed positioning in the bottom-right corner
 * - Automatic userId retrieval from localStorage or Supabase auth
 * - Consistent styling across all pages
 *
 * Usage: Add <VoiceAssistantWrapper /> to any page that needs voice commands
 */
export function VoiceAssistantWrapper() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Try to get userId from localStorage first
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <VoiceCommandButton userId={userId} />
    </div>
  );
}
