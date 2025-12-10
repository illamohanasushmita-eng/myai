import { Intent } from "./intent-classifier";

export interface ActionResult {
  success: boolean;
  message: string;
  action: string;
  data?: any;
}

/**
 * Route and execute actions based on classified intent
 */
export async function routeAction(intent: Intent): Promise<ActionResult> {
  try {
    console.log("🎤 Routing action for intent:", intent.intent);

    switch (intent.intent) {
      case "play_music":
        return await handlePlayMusic(intent);
      case "add_task":
        return await handleAddTask(intent);
      case "show_tasks":
        return await handleShowTasks(intent);
      case "add_reminder":
        return await handleAddReminder(intent);
      case "show_reminders":
        return await handleShowReminders(intent);
      case "navigate":
        return await handleNavigate(intent);
      case "general_query":
        return await handleGeneralQuery(intent);
      default:
        return {
          success: false,
          message: "Unknown intent",
          action: "unknown",
        };
    }
  } catch (error) {
    console.error("❌ Error routing action:", error);
    throw error;
  }
}

/**
 * Handle play music action
 */
async function handlePlayMusic(intent: Intent): Promise<ActionResult> {
  try {
    console.log("🎵 Playing music:", intent.musicQuery);

    if (!intent.musicQuery) {
      return {
        success: false,
        message: "No music query provided",
        action: "play_music",
      };
    }

    // Search for music on Spotify
    const searchResponse = await fetch("/api/spotify/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: intent.musicQuery }),
    });

    if (!searchResponse.ok) {
      throw new Error("Failed to search music");
    }

    const searchData = await searchResponse.json();

    if (!searchData.tracks || searchData.tracks.length === 0) {
      return {
        success: false,
        message: `No music found for "${intent.musicQuery}"`,
        action: "play_music",
      };
    }

    // Play the first track
    const playResponse = await fetch("/api/spotify/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: searchData.tracks[0].id }),
    });

    if (!playResponse.ok) {
      throw new Error("Failed to play music");
    }

    return {
      success: true,
      message: `Now playing ${searchData.tracks[0].name}`,
      action: "play_music",
      data: searchData.tracks[0],
    };
  } catch (error) {
    console.error("❌ Error playing music:", error);
    return {
      success: false,
      message: "Failed to play music",
      action: "play_music",
    };
  }
}

/**
 * Handle add task action
 */
async function handleAddTask(intent: Intent): Promise<ActionResult> {
  try {
    console.log("📝 Adding task:", intent.taskText);

    if (!intent.taskText) {
      return {
        success: false,
        message: "No task text provided",
        action: "add_task",
      };
    }

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: intent.taskText }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }

    const data = await response.json();

    return {
      success: true,
      message: `Task added: ${intent.taskText}`,
      action: "add_task",
      data,
    };
  } catch (error) {
    console.error("❌ Error adding task:", error);
    return {
      success: false,
      message: "Failed to add task",
      action: "add_task",
    };
  }
}

/**
 * Handle show tasks action
 */
async function handleShowTasks(intent: Intent): Promise<ActionResult> {
  try {
    console.log("📋 Showing tasks");

    return {
      success: true,
      message: "Navigating to tasks",
      action: "show_tasks",
      data: { navigationTarget: "/tasks" },
    };
  } catch (error) {
    console.error("❌ Error showing tasks:", error);
    return {
      success: false,
      message: "Failed to show tasks",
      action: "show_tasks",
    };
  }
}

/**
 * Handle add reminder action
 */
async function handleAddReminder(intent: Intent): Promise<ActionResult> {
  try {
    console.log("⏰ Adding reminder:", intent.taskText, "at", intent.time);

    if (!intent.taskText) {
      return {
        success: false,
        message: "No reminder text provided",
        action: "add_reminder",
      };
    }

    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: intent.taskText,
        time: intent.time || null,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add reminder");
    }

    const data = await response.json();

    return {
      success: true,
      message: `Reminder set: ${intent.taskText}${intent.time ? ` at ${intent.time}` : ""}`,
      action: "add_reminder",
      data,
    };
  } catch (error) {
    console.error("❌ Error adding reminder:", error);
    return {
      success: false,
      message: "Failed to add reminder",
      action: "add_reminder",
    };
  }
}

/**
 * Handle show reminders action
 */
async function handleShowReminders(intent: Intent): Promise<ActionResult> {
  try {
    console.log("📌 Showing reminders");

    return {
      success: true,
      message: "Navigating to reminders",
      action: "show_reminders",
      data: { navigationTarget: "/reminders" },
    };
  } catch (error) {
    console.error("❌ Error showing reminders:", error);
    return {
      success: false,
      message: "Failed to show reminders",
      action: "show_reminders",
    };
  }
}

/**
 * Handle navigate action
 */
async function handleNavigate(intent: Intent): Promise<ActionResult> {
  try {
    console.log("🧭 Navigating to:", intent.navigationTarget);

    if (!intent.navigationTarget) {
      return {
        success: false,
        message: "No navigation target provided",
        action: "navigate",
      };
    }

    return {
      success: true,
      message: `Navigating to ${intent.navigationTarget}`,
      action: "navigate",
      data: { navigationTarget: intent.navigationTarget },
    };
  } catch (error) {
    console.error("❌ Error navigating:", error);
    return {
      success: false,
      message: "Failed to navigate",
      action: "navigate",
    };
  }
}

/**
 * Handle general query action
 */
async function handleGeneralQuery(intent: Intent): Promise<ActionResult> {
  try {
    console.log("💬 Processing general query:", intent.query);

    if (!intent.query) {
      return {
        success: false,
        message: "No query provided",
        action: "general_query",
      };
    }

    return {
      success: true,
      message: `Query processed: ${intent.query}`,
      action: "general_query",
      data: { query: intent.query },
    };
  } catch (error) {
    console.error("❌ Error processing query:", error);
    return {
      success: false,
      message: "Failed to process query",
      action: "general_query",
    };
  }
}
