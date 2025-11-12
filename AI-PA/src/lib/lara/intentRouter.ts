/**
 * Intent Router for Lara Voice Assistant
 * Maps Wit.ai intents to actions
 */

import { LaraContext } from '@/lib/voice/lara-assistant';
import { automateSpotifyPlayback } from '@/lib/voice/spotify-automation';

export interface WitIntentResult {
  intent: string | null;
  confidence: number;
  entities: Record<string, any>;
  raw: any;
}

/**
 * Route intent to appropriate action
 */
export async function routeIntent(
  intentResult: WitIntentResult,
  userText: string,
  context: LaraContext
): Promise<string> {
  try {
    const { intent, entities } = intentResult;

    if (!intent) {
      console.log('⚠️ No intent detected');
      return 'I did not understand that. Please try again.';
    }

    console.log(`🎯 Routing intent: ${intent}`);

    // Music playback intents (handle both dot and underscore notation)
    if (intent === 'music.play' || intent === 'music_play' || intent === 'play_music') {
      console.log('🎵 Playing music');
      const songName = extractSongName(userText, entities);
      console.log(`🎵 Extracted song name: ${songName}`);

      // Check if song name is valid (not just "a", "song", etc.)
      const isValidSongName = songName &&
        songName.trim().length > 1 &&
        !['a', 'song', 'music', 'track', 'a song', 'a music', 'a track'].includes(songName.toLowerCase());

      if (isValidSongName) {
        console.log(`🎵 Calling Spotify automation with: ${songName}`);
        await automateSpotifyPlayback(songName, context.userId);
        return `Now playing ${songName}`;
      }
      return 'Please specify a song name';
    }

    // Tasks intents (handle both dot and underscore notation)
    if (intent === 'tasks.show' || intent === 'tasks.open' || intent === 'tasks_show' || intent === 'show_tasks') {
      console.log('📋 Opening tasks page');
      console.log('📋 Context:', {
        hasOnNavigate: !!context.onNavigate,
        hasRouter: !!context.router,
        userId: context.userId
      });

      try {
        const navStartTime = performance.now();
        if (context.onNavigate) {
          console.log('📋 Using onNavigate callback');
          context.onNavigate('/tasks');
          const navEndTime = performance.now();
          console.log('📋 onNavigate callback executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
        } else if (context.router) {
          console.log('📋 Using router.push');
          context.router.push('/tasks');
          const navEndTime = performance.now();
          console.log('📋 router.push executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
        } else {
          console.error('❌ No navigation method available in context');
        }
      } catch (error) {
        console.error('❌ Error during navigation:', error);
      }
      return 'Opening tasks page';
    }

    // Add task intents
    if (intent === 'add_task') {
      console.log('➕ Opening add task page');
      const taskText = entities.taskText || '';
      if (taskText && taskText.trim().length > 0) {
        // If we have task text, create the task directly
        try {
          if (context.onAddTask) {
            console.log('📝 Calling onAddTask with text:', taskText);
            await context.onAddTask(taskText);
            return `Task added: ${taskText}`;
          }
        } catch (error) {
          console.error('❌ Error creating task:', error);
          return `Failed to add task: ${taskText}`;
        }
      }
      // If no task text, navigate to add task page
      if (context.onNavigate) {
        context.onNavigate('/tasks/add');
      } else if (context.router) {
        context.router.push('/tasks/add');
      }
      return 'Opening add task page';
    }

    // Reminders intents (handle both dot and underscore notation)
    // NOTE: reminder_create is handled separately below with actual creation logic
    if (intent === 'reminder.create' || intent === 'reminder.add' || intent === 'add_reminder') {
      console.log('➕ Opening add reminder page');
      const reminderText = entities.reminderText || '';
      if (context.onNavigate) {
        context.onNavigate('/reminders/add');
      } else if (context.router) {
        context.router.push('/reminders/add');
      }
      return reminderText ? `Setting reminder: ${reminderText}` : 'Opening add reminder page';
    }

    if (intent === 'reminders.open' || intent === 'reminders.show' || intent === 'reminders_open' || intent === 'show_reminders') {
      console.log('📌 Opening reminders page');
      try {
        const navStartTime = performance.now();
        if (context.onNavigate) {
          context.onNavigate('/reminders');
          const navEndTime = performance.now();
          console.log('📌 onNavigate callback executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
        } else if (context.router) {
          context.router.push('/reminders');
          const navEndTime = performance.now();
          console.log('📌 router.push executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
        }
      } catch (error) {
        console.error('❌ Error during navigation:', error);
      }
      return 'Opening reminders page';
    }

    // Handle Cohere's reminders_show intent
    if (intent === 'reminders_show') {
      console.log('📌 Opening reminders page (Cohere)');
      try {
        if (context.onNavigate) {
          context.onNavigate('/reminders');
        } else if (context.router) {
          context.router.push('/reminders');
        }
      } catch (error) {
        console.error('❌ Error during navigation:', error);
      }
      return 'Opening reminders page';
    }

    // Handle Cohere's task_create intent
    if (intent === 'task_create') {
      console.log('➕ Creating task (Cohere)');
      const title = entities.title || '';

      if (title && title.trim().length > 0) {
        // Actually create the task
        console.log('📝 Task title extracted:', title);
        try {
          if (context.onAddTask) {
            console.log('📝 Calling onAddTask with title:', title);
            await context.onAddTask(title);
            return `Task added: ${title}`;
          }
        } catch (error) {
          console.error('❌ Error creating task:', error);
          return `Failed to add task: ${title}`;
        }
      }

      // If no title, just navigate to add task page
      try {
        if (context.onNavigate) {
          context.onNavigate('/tasks/add');
        } else if (context.router) {
          context.router.push('/tasks/add');
        }
      } catch (error) {
        console.error('❌ Error during navigation:', error);
      }
      return 'Opening add task page';
    }

    // Handle Cohere's reminder_create intent
    if (intent === 'reminder_create') {
      console.log('➕ Creating reminder (Cohere)');
      console.log('📌 Entities received:', JSON.stringify(entities));
      const description = entities.description || '';
      const time = entities.time || '';

      console.log('📌 Description:', description, 'Length:', description.length);
      console.log('📌 Time:', time, 'Length:', time.length);

      if (description && description.trim().length > 0) {
        // Actually create the reminder
        console.log('📌 Reminder description extracted:', description);
        console.log('📌 Reminder time extracted:', time);
        try {
          if (context.onAddReminder) {
            console.log('📌 Calling onAddReminder with description:', description, 'time:', time);
            const result = await context.onAddReminder(description, time);
            console.log('📌 onAddReminder result:', result);
            return time ? `Reminder set: ${description} at ${time}` : `Reminder set: ${description}`;
          } else {
            console.error('❌ onAddReminder callback not available');
            console.log('📌 Context keys:', Object.keys(context));
          }
        } catch (error) {
          console.error('❌ Error creating reminder:', error);
          return `Failed to set reminder: ${description}`;
        }
      } else {
        console.log('⚠️ No description found, navigating to add reminder page');
      }

      // If no description, just navigate to reminders page
      try {
        if (context.onNavigate) {
          context.onNavigate('/reminders/add');
        } else if (context.router) {
          context.router.push('/reminders/add');
        }
      } catch (error) {
        console.error('❌ Error during navigation:', error);
      }
      return 'Opening add reminder page';
    }

    // Handle Cohere's navigate intent
    if (intent === 'navigate') {
      console.log('🗺️ Navigating to page (Cohere)');
      console.log('🗺️ Entities:', entities);
      let page = entities.page || extractPageName(userText, entities);

      // Clean up page name (remove trailing period and "page" word)
      if (page) {
        // Remove trailing periods, "page" word, and extra whitespace
        page = page.replace(/\s*page\.?$/i, '').replace(/\.+$/i, '').trim();
        console.log('🗺️ Cleaned page name:', page);
      }

      const path = mapPageToPath(page);
      console.log('🗺️ Mapped path:', path);

      if (path) {
        try {
          const navStartTime = performance.now();
          console.log('🗺️ Attempting navigation to:', path);
          if (context.onNavigate) {
            console.log('🗺️ Using onNavigate callback');
            context.onNavigate(path);
            const navEndTime = performance.now();
            console.log('🗺️ onNavigate callback executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
          } else if (context.router) {
            console.log('🗺️ Using router.push');
            context.router.push(path);
            const navEndTime = performance.now();
            console.log('🗺️ router.push executed', `(${(navEndTime - navStartTime).toFixed(0)}ms)`);
          } else {
            console.log('🗺️ No navigation method available!');
          }
        } catch (error) {
          console.error('❌ Error during navigation:', error);
        }
        return `Opening ${page} page`;
      }
      console.log('🗺️ Could not determine page from:', { page, userText, entities });
      return 'Could not determine which page to open';
    }

    // Handle Cohere's general_greeting intent
    if (intent === 'general_greeting') {
      console.log('👋 Greeting detected (Cohere)');
      return 'Hello! How can I help you?';
    }

    // Handle Cohere's general_unknown intent
    if (intent === 'general_unknown') {
      console.log('❓ Unknown intent (Cohere)');

      // Check if the user text looks like a task/reminder description (without trigger words)
      // Pattern: starts with "to" or contains action words like "attend", "call", "buy", etc.
      const lowerUserText = userText.toLowerCase().trim();
      const descriptionPatterns = [
        /^to\s+/i,  // "to attend the scrum"
        /^(?:attend|call|buy|send|check|review|finish|complete|do|make|get|take|read|write|prepare|schedule|book|plan|organize|clean|fix|update|create|delete|edit|submit|approve|reject|confirm|cancel|reschedule)/i
      ];

      const looksLikeDescription = descriptionPatterns.some(pattern => pattern.test(lowerUserText));

      if (looksLikeDescription) {
        console.log('💡 Detected possible task/reminder description without trigger word');
        // Ask for clarification
        return 'I can help you create a task or reminder. Please say "add task" or "add reminder" followed by your description.';
      }

      return 'I did not understand that. Please try again.';
    }

    // Navigation intents (handle both dot and underscore notation)
    if (intent === 'navigation.open_page' || intent === 'navigation_open_page' || intent === 'navigate') {
      console.log('🗺️ Navigating to page');
      const navigationTarget = entities.navigationTarget || null;
      const page = navigationTarget || extractPageName(userText, entities);
      const path = mapPageToPath(page);
      if (path) {
        if (context.onNavigate) {
          context.onNavigate(path);
        } else if (context.router) {
          context.router.push(path);
        }
        return `Opening ${page} page`;
      }
      return 'Could not determine which page to open';
    }

    // Default fallback
    console.log('❓ Unknown intent:', intent);
    return 'Processing your request';
  } catch (error) {
    console.error('❌ Intent routing error:', error);
    return 'Sorry, I encountered an error processing your request';
  }
}

/**
 * Extract song name from user text and entities
 */
function extractSongName(userText: string, entities: Record<string, any>): string | null {
  // Try to extract from fallback entities first (songName from witai-fallback.ts)
  if (entities.songName) {
    const songName = entities.songName.trim();
    if (songName && songName.toLowerCase() !== 'song' && songName.toLowerCase() !== 'a song') {
      return songName;
    }
  }

  // Try to extract from Wit.ai entities
  if (entities.music_entity) {
    const musicEntity = Array.isArray(entities.music_entity)
      ? entities.music_entity[0]
      : entities.music_entity;
    if (musicEntity && musicEntity.value) {
      return musicEntity.value;
    }
  }

  // Try to extract from text patterns
  const patterns = [
    /play\s+(?:a\s+)?(?:song|music|track)(?:\s+called)?\s+(.+?)(?:\s+by|$)/i,
    /play\s+(?:me\s+)?(.+?)\s+(?:song|music|track)/i,
    /play\s+(?:the\s+)?(?:song|music|track)\s+(.+?)(?:\s+by|$)/i,
    /play\s+(?:me\s+)?(.+?)(?:\s+by|$)/i,
  ];

  for (const pattern of patterns) {
    const match = userText.match(pattern);
    if (match && match[1]) {
      const songName = match[1].trim();
      if (songName.toLowerCase() !== 'song' && songName.toLowerCase() !== 'a song') {
        return songName;
      }
    }
  }

  return null;
}

/**
 * Extract page name from user text and entities
 */
function extractPageName(userText: string, entities: Record<string, any>): string | null {
  // Try to extract from entities first
  if (entities.page_entity) {
    const pageEntity = Array.isArray(entities.page_entity)
      ? entities.page_entity[0]
      : entities.page_entity;
    if (pageEntity && pageEntity.value) {
      return pageEntity.value;
    }
  }

  // Try to extract from entities.page (Cohere format)
  if (entities.page) {
    return entities.page;
  }

  // Try to extract from text patterns
  const pagePatterns: Record<string, string> = {
    'at home': 'at-home',
    'at-home': 'at-home',
    home: 'home',
    dashboard: 'home',
    professional: 'professional',
    work: 'professional',
    tasks: 'tasks',
    task: 'tasks',
    reminders: 'reminders',
    reminder: 'reminders',
    'personal growth': 'personal-growth',
    'personal-growth': 'personal-growth',
    growth: 'personal-growth',
    healthcare: 'healthcare',
    health: 'healthcare',
    automotive: 'automotive',
    car: 'automotive',
    vehicle: 'automotive',
    insights: 'insights',
    profile: 'profile',
    settings: 'settings',
  };

  const lowerText = userText.toLowerCase();
  // Sort patterns by length (longest first) to match more specific patterns first
  const sortedPatterns = Object.entries(pagePatterns).sort((a, b) => b[0].length - a[0].length);

  for (const [pattern, page] of sortedPatterns) {
    if (lowerText.includes(pattern)) {
      return page;
    }
  }

  return null;
}

/**
 * Map page name to route path
 */
function mapPageToPath(page: string | null): string | null {
  if (!page) return null;

  const pageLower = page.toLowerCase().trim();

  const pageMap: Record<string, string> = {
    // Home/Dashboard
    home: '/dashboard',
    dashboard: '/dashboard',
    'at home': '/at-home',
    'at-home': '/at-home',

    // Professional
    professional: '/professional',
    work: '/professional',

    // Tasks
    tasks: '/tasks',
    task: '/tasks',

    // Reminders
    reminders: '/reminders',
    reminder: '/reminders',

    // Personal Growth
    'personal-growth': '/personal-growth',
    'personal growth': '/personal-growth',
    growth: '/personal-growth',

    // Healthcare
    healthcare: '/healthcare',
    health: '/healthcare',

    // Automotive
    automotive: '/automotive',
    car: '/automotive',
    vehicle: '/automotive',

    // Insights
    insights: '/insights',

    // Profile & Settings
    profile: '/settings/profile',
    settings: '/settings',
  };

  return pageMap[pageLower] || null;
}

