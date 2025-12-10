/**
 * Navigation Automation Module
 * Handles voice-triggered navigation to different sections
 */

export interface NavigationTarget {
  path: string;
  label: string;
  aliases: string[];
}

// ============================================================================
// NAVIGATION TARGETS
// ============================================================================

export const NAVIGATION_TARGETS: Record<string, NavigationTarget> = {
  tasks: {
    path: "/professional",
    label: "Tasks",
    aliases: ["tasks", "task", "my tasks", "task list", "todo", "to do"],
  },
  reminders: {
    path: "/reminders",
    label: "Reminders",
    aliases: ["reminders", "reminder", "my reminders", "reminder list"],
  },
  health: {
    path: "/healthcare",
    label: "Health",
    aliases: ["health", "healthcare", "health data", "medical", "doctor"],
  },
  professional: {
    path: "/professional",
    label: "Professional",
    aliases: ["professional", "work", "my work", "projects", "meetings"],
  },
  home: {
    path: "/at-home",
    label: "Home",
    aliases: ["home", "at home", "home tasks", "chores", "family"],
  },
  growth: {
    path: "/personal-growth",
    label: "Personal Growth",
    aliases: ["growth", "personal growth", "learning", "habits", "goals"],
  },
  dashboard: {
    path: "/dashboard",
    label: "Dashboard",
    aliases: ["dashboard", "home", "main", "start"],
  },
  profile: {
    path: "/profile",
    label: "Profile",
    aliases: ["profile", "my profile", "settings", "account"],
  },
};

// ============================================================================
// RESOLVE NAVIGATION TARGET
// ============================================================================

export function resolveNavigationTarget(
  query: string,
): NavigationTarget | null {
  const lowerQuery = query.toLowerCase().trim();

  for (const [key, target] of Object.entries(NAVIGATION_TARGETS)) {
    for (const alias of target.aliases) {
      if (lowerQuery.includes(alias)) {
        return target;
      }
    }
  }

  return null;
}

// ============================================================================
// NAVIGATE
// ============================================================================

export async function navigateVoice(
  destination: string,
  router?: any,
): Promise<{ success: boolean; path: string; message: string }> {
  try {
    const target = resolveNavigationTarget(destination);

    if (!target) {
      return {
        success: false,
        path: "",
        message: `Could not find destination: ${destination}`,
      };
    }

    if (router) {
      router.push(target.path);
    }

    return {
      success: true,
      path: target.path,
      message: `Navigating to ${target.label}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Navigation error:", error);

    return {
      success: false,
      path: "",
      message: `Failed to navigate: ${errorMessage}`,
    };
  }
}

// ============================================================================
// GET AVAILABLE DESTINATIONS
// ============================================================================

export function getAvailableDestinations(): string[] {
  return Object.values(NAVIGATION_TARGETS).map((target) => target.label);
}

// ============================================================================
// SUGGEST DESTINATION
// ============================================================================

export function suggestDestination(query: string): NavigationTarget | null {
  const lowerQuery = query.toLowerCase().trim();

  // Exact match
  for (const target of Object.values(NAVIGATION_TARGETS)) {
    if (target.aliases.some((alias) => lowerQuery === alias)) {
      return target;
    }
  }

  // Partial match
  for (const target of Object.values(NAVIGATION_TARGETS)) {
    if (target.aliases.some((alias) => lowerQuery.includes(alias))) {
      return target;
    }
  }

  return null;
}

// ============================================================================
// VOICE NAVIGATION SUMMARY
// ============================================================================

export function getNavigationSummaryVoice(): string {
  const destinations = getAvailableDestinations();
  return `You can navigate to: ${destinations.join(", ")}.`;
}
