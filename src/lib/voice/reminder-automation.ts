/**
 * Reminder Automation Module
 * Handles voice-triggered reminder creation and management
 *
 * TIMEZONE: All dates and times are calculated in Asia/Kolkata (IST, UTC+5:30)
 * Output format: ISO 8601 with explicit IST offset (+05:30), never UTC (Z)
 */

// IST Timezone offset: UTC+5:30 = 5.5 hours = 19800 seconds
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 19800000 ms

// Default times for relative date expressions (in IST)
const DEFAULT_TIMES = {
  tomorrow: { hour: 9, minute: 0 },      // 9:00 AM
  today: { hour: 21, minute: 0 },        // 9:00 PM (changed from 9:00 AM)
  tonight: { hour: 21, minute: 0 },      // 9:00 PM
  evening: { hour: 19, minute: 0 },      // 7:00 PM
  afternoon: { hour: 15, minute: 0 },    // 3:00 PM
  dayAfterTomorrow: { hour: 9, minute: 0 }, // 9:00 AM
  nextWeek: { hour: 9, minute: 0 },      // 9:00 AM (Monday)
  dayName: { hour: 9, minute: 0 },       // 9:00 AM
};

// Note: This interface is for internal use in reminder-automation.ts
// For the actual database Reminder type, use the one from @/lib/types/database
// This is kept for backward compatibility with existing code
export interface Reminder {
  reminder_id?: string;
  id?: string;
  title: string;
  description?: string;
  reminder_time?: string;
  reminderTime?: string;
  status?: string;
  completed?: boolean;
  created_at?: string;
  createdAt?: string;
  user_id?: string;
  userId?: string;
}

export interface ReminderCreationResult {
  success: boolean;
  reminder?: Reminder;
  message: string;
  error?: string;
}

// ============================================================================
// TIMEZONE UTILITIES (IST - Asia/Kolkata, UTC+5:30)
// ============================================================================

/**
 * Get current time in IST timezone
 * Returns a Date object representing the current moment in IST
 */
function getCurrentTimeInIST(): Date {
  const now = new Date();
  // Convert to IST by adding the offset
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  return istTime;
}

/**
 * Convert a Date object to ISO 8601 string with IST offset (+05:30)
 * Never returns UTC format (Z)
 */
function toISTString(date: Date): string {
  // Format: YYYY-MM-DDTHH:mm:ss+05:30
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

/**
 * Get today's date in IST (midnight IST)
 */
function getTodayInIST(): Date {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);

  // Create a date at midnight IST
  const todayIST = new Date(Date.UTC(
    istTime.getUTCFullYear(),
    istTime.getUTCMonth(),
    istTime.getUTCDate(),
    0, 0, 0, 0
  ));

  return todayIST;
}

/**
 * Get tomorrow's date in IST (midnight IST)
 */
function getTomorrowInIST(): Date {
  const today = getTodayInIST();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  return tomorrow;
}

/**
 * Check if a given datetime in IST is in the past
 */
function isPastInIST(dateIST: Date): boolean {
  const nowIST = getCurrentTimeInIST();
  return dateIST.getTime() < nowIST.getTime();
}

// ============================================================================
// TIME PARSING
// ============================================================================

export function parseTimeFromText(text: string): string | null {
  // Match patterns like "5 PM", "5pm", "17:00", "5:30 PM"
  const timePatterns = [
    /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/,
    /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      const hour = match[1];
      const minute = match[2] || '00';
      const period = match[3]?.toLowerCase() || '';

      let hour24 = parseInt(hour);
      if (period === 'pm' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'am' && hour24 === 12) {
        hour24 = 0;
      }

      return `${String(hour24).padStart(2, '0')}:${minute}`;
    }
  }

  return null;
}

/**
 * Parse day name and return the next upcoming occurrence of that day in IST
 * If today is Monday and user says "Monday", returns next Monday (7 days from now)
 * All calculations are done in IST timezone
 */
export function getNextDayOfWeek(dayName: string): Date {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = dayNames.indexOf(dayName.toLowerCase());

  if (targetDay === -1) {
    console.log('📌 [GET-NEXT-DAY] Invalid day name:', dayName);
    return getTodayInIST(); // Return today if invalid
  }

  // Get today in IST
  const todayIST = getTodayInIST();
  const todayUTC = new Date(todayIST.getTime() - IST_OFFSET_MS);
  const currentDay = todayUTC.getUTCDay();

  console.log('📌 [GET-NEXT-DAY] Target day:', dayName, '(index:', targetDay, '), Current day index (IST):', currentDay);

  let daysToAdd = targetDay - currentDay;

  // If the target day is today or in the past this week, move to next week
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  console.log('📌 [GET-NEXT-DAY] Days to add:', daysToAdd);

  const nextDate = new Date(todayIST.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  console.log('📌 [GET-NEXT-DAY] Next occurrence of', dayName, '(IST):', new Date(nextDate.getTime() - IST_OFFSET_MS).toDateString());

  return nextDate;
}

/**
 * Convert reminder text and time to full ISO timestamp in IST timezone
 * Handles "tomorrow", "today", "tonight", day names (Monday, Tuesday, etc.), and specific times
 *
 * TIMEZONE: All calculations are in IST (UTC+5:30)
 * OUTPUT: ISO 8601 format with +05:30 offset, never UTC (Z)
 *
 * Default times for relative dates:
 * - "tomorrow": 9:00 AM IST
 * - "today": 9:00 AM IST
 * - "tonight": 8:00 PM IST
 * - "evening": 7:00 PM IST
 * - "afternoon": 3:00 PM IST
 * - Day names: 9:00 AM IST
 */
export function convertToISOTimestamp(text: string, timeStr?: string): string {
  console.log('📌 [CONVERT-TIMESTAMP] Converting text:', text, 'time:', timeStr, '(IST timezone)');

  const nowIST = getCurrentTimeInIST();
  let targetDateIST = new Date(nowIST);
  const lowerText = text.toLowerCase();
  const lowerTimeStr = timeStr ? timeStr.toLowerCase() : '';
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let foundDayName = false;
  let foundRelativeDate = false;
  let relativeType = ''; // Track which relative date was found
  let extractedTime: string | null = null;

  // First, check if timeStr contains a day name (e.g., "tuesday 5:30")
  if (timeStr && timeStr.trim().length > 0) {
    // Check if timeStr contains a day name
    for (const dayName of dayNames) {
      if (lowerTimeStr.includes(dayName)) {
        console.log('📌 [CONVERT-TIMESTAMP] Day name detected in timeStr:', dayName);
        targetDateIST = getNextDayOfWeek(dayName);
        foundDayName = true;

        // Extract the time part after the day name
        const dayIndex = lowerTimeStr.indexOf(dayName);
        const afterDay = lowerTimeStr.substring(dayIndex + dayName.length).trim();
        if (afterDay.length > 0) {
          extractedTime = afterDay;
          console.log('📌 [CONVERT-TIMESTAMP] Extracted time from timeStr:', extractedTime);
        }
        break;
      }
    }

    // If no day name found in timeStr, check for relative dates in timeStr
    if (!foundDayName) {
      if (lowerTimeStr.includes('tomorrow')) {
        console.log('📌 [CONVERT-TIMESTAMP] "tomorrow" detected in timeStr (IST)');
        targetDateIST = getTomorrowInIST();
        foundRelativeDate = true;
        relativeType = 'tomorrow';
      } else if (lowerTimeStr.includes('today')) {
        console.log('📌 [CONVERT-TIMESTAMP] "today" detected in timeStr (IST)');
        targetDateIST = getTodayInIST();
        foundRelativeDate = true;
        relativeType = 'today';
      } else if (lowerTimeStr.includes('tonight')) {
        console.log('📌 [CONVERT-TIMESTAMP] "tonight" detected in timeStr (IST)');
        targetDateIST = getTodayInIST();
        foundRelativeDate = true;
        relativeType = 'tonight';
      } else if (lowerTimeStr.includes('evening')) {
        console.log('📌 [CONVERT-TIMESTAMP] "evening" detected in timeStr (IST)');
        targetDateIST = getTodayInIST();
        foundRelativeDate = true;
        relativeType = 'evening';
      } else if (lowerTimeStr.includes('afternoon')) {
        console.log('📌 [CONVERT-TIMESTAMP] "afternoon" detected in timeStr (IST)');
        targetDateIST = getTodayInIST();
        foundRelativeDate = true;
        relativeType = 'afternoon';
      }
    }
  }

  // If no day name or relative date found in timeStr, check in the text
  if (!foundDayName && !foundRelativeDate) {
    for (const dayName of dayNames) {
      if (lowerText.includes(dayName)) {
        console.log('📌 [CONVERT-TIMESTAMP] Day name detected in text:', dayName);
        targetDateIST = getNextDayOfWeek(dayName);
        foundDayName = true;
        break;
      }
    }
  }

  // If no day name found, check for relative dates in text
  if (!foundDayName && !foundRelativeDate) {
    if (lowerText.includes('tomorrow')) {
      console.log('📌 [CONVERT-TIMESTAMP] "tomorrow" detected in text (IST)');
      targetDateIST = getTomorrowInIST();
      foundRelativeDate = true;
      relativeType = 'tomorrow';
    } else if (lowerText.includes('today')) {
      console.log('📌 [CONVERT-TIMESTAMP] "today" detected in text (IST)');
      targetDateIST = getTodayInIST();
      foundRelativeDate = true;
      relativeType = 'today';
    } else if (lowerText.includes('tonight')) {
      console.log('📌 [CONVERT-TIMESTAMP] "tonight" detected in text (IST)');
      targetDateIST = getTodayInIST();
      foundRelativeDate = true;
      relativeType = 'tonight';
    } else if (lowerText.includes('evening')) {
      console.log('📌 [CONVERT-TIMESTAMP] "evening" detected in text (IST)');
      targetDateIST = getTodayInIST();
      foundRelativeDate = true;
      relativeType = 'evening';
    } else if (lowerText.includes('afternoon')) {
      console.log('📌 [CONVERT-TIMESTAMP] "afternoon" detected in text (IST)');
      targetDateIST = getTodayInIST();
      foundRelativeDate = true;
      relativeType = 'afternoon';
    }
  }

  // Parse time - use extracted time from timeStr first, then timeStr, then text
  let parsedTime: string | null = null;

  if (extractedTime) {
    // We extracted time from timeStr after removing day name
    parsedTime = parseTimeFromText(extractedTime);
    if (parsedTime) {
      console.log('📌 [CONVERT-TIMESTAMP] Parsed time from extracted timeStr:', parsedTime);
    }
  } else if (timeStr && timeStr.trim().length > 0 && !foundRelativeDate) {
    // Try to parse time from the full timeStr (but not if it's a relative date like "tomorrow")
    parsedTime = parseTimeFromText(timeStr);
    if (parsedTime) {
      console.log('📌 [CONVERT-TIMESTAMP] Parsed time from timeStr:', parsedTime);
    }
  } else if (!foundRelativeDate) {
    // Try to parse time from text (but not if we already found a relative date)
    parsedTime = parseTimeFromText(text);
    if (parsedTime) {
      console.log('📌 [CONVERT-TIMESTAMP] Parsed time from text:', parsedTime);
    }
  }

  // Apply the parsed time to the target date
  if (parsedTime) {
    const timeParts = parsedTime.split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    console.log('📌 [CONVERT-TIMESTAMP] Setting time to', hour, ':', minute, '(IST)');
    targetDateIST.setUTCHours(hour, minute, 0, 0);
  } else if (foundRelativeDate && relativeType) {
    // Use default time for relative date expressions
    const defaultTime = DEFAULT_TIMES[relativeType as keyof typeof DEFAULT_TIMES] || DEFAULT_TIMES.dayName;
    console.log('📌 [CONVERT-TIMESTAMP] Using default time for', relativeType, ':', defaultTime.hour, ':', defaultTime.minute, '(IST)');
    targetDateIST.setUTCHours(defaultTime.hour, defaultTime.minute, 0, 0);
  } else if (foundDayName) {
    // Use default time for day names
    console.log('📌 [CONVERT-TIMESTAMP] Using default time for day name: 09:00 (IST)');
    targetDateIST.setUTCHours(DEFAULT_TIMES.dayName.hour, DEFAULT_TIMES.dayName.minute, 0, 0);
  } else {
    // No specific date or time found - use today at 9 PM IST
    console.log('📌 [CONVERT-TIMESTAMP] No date/time found, defaulting to today at 21:00 (IST)');
    targetDateIST = getTodayInIST();
    targetDateIST.setUTCHours(DEFAULT_TIMES.today.hour, DEFAULT_TIMES.today.minute, 0, 0);
  }

  // Check if the calculated time is in the past and adjust if needed
  if (isPastInIST(targetDateIST)) {
    console.log('⚠️  [CONVERT-TIMESTAMP] Calculated time is in the past (IST), adjusting to next occurrence');

    if (foundRelativeDate && relativeType === 'tonight') {
      // If "tonight" has passed, move to tomorrow night
      targetDateIST = getTomorrowInIST();
      targetDateIST.setUTCHours(DEFAULT_TIMES.tonight.hour, DEFAULT_TIMES.tonight.minute, 0, 0);
      console.log('⚠️  [CONVERT-TIMESTAMP] "tonight" has passed, adjusted to tomorrow at 20:00 (IST)');
    } else if (foundRelativeDate && relativeType === 'evening') {
      // If "evening" has passed, move to tomorrow evening
      targetDateIST = getTomorrowInIST();
      targetDateIST.setUTCHours(DEFAULT_TIMES.evening.hour, DEFAULT_TIMES.evening.minute, 0, 0);
      console.log('⚠️  [CONVERT-TIMESTAMP] "evening" has passed, adjusted to tomorrow at 19:00 (IST)');
    } else if (foundRelativeDate && relativeType === 'afternoon') {
      // If "afternoon" has passed, move to tomorrow afternoon
      targetDateIST = getTomorrowInIST();
      targetDateIST.setUTCHours(DEFAULT_TIMES.afternoon.hour, DEFAULT_TIMES.afternoon.minute, 0, 0);
      console.log('⚠️  [CONVERT-TIMESTAMP] "afternoon" has passed, adjusted to tomorrow at 15:00 (IST)');
    } else if (foundRelativeDate && relativeType === 'today') {
      // If "today" at 9 AM has passed, move to tomorrow at 9 AM
      targetDateIST = getTomorrowInIST();
      targetDateIST.setUTCHours(DEFAULT_TIMES.today.hour, DEFAULT_TIMES.today.minute, 0, 0);
      console.log('⚠️  [CONVERT-TIMESTAMP] "today" at 09:00 has passed, adjusted to tomorrow at 09:00 (IST)');
    }
  }

  const istTimestamp = toISTString(targetDateIST);
  console.log('📌 [CONVERT-TIMESTAMP] Final ISO timestamp (IST):', istTimestamp);
  return istTimestamp;
}

// ============================================================================
// TEXT TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform reminder text from first-person to second-person
 * Removes command phrases and replaces pronouns
 */
function transformReminderText(text: string): string {
  let transformed = text;

  // Remove command phrases
  const commandPhrases = [
    /^add\s+reminder\s+to\s+/i,
    /^remind\s+me\s+to\s+/i,
    /^create\s+reminder\s+to\s+/i,
    /^set\s+reminder\s+to\s+/i,
    /^add\s+reminder\s+/i,
    /^remind\s+me\s+/i,
    /^create\s+reminder\s+/i,
    /^set\s+reminder\s+/i,
  ];

  for (const phrase of commandPhrases) {
    transformed = transformed.replace(phrase, '');
  }

  // Replace first-person pronouns with second-person
  // Order matters: do longer patterns first to avoid partial replacements
  transformed = transformed.replace(/\bI'm\b/gi, "you're");
  transformed = transformed.replace(/\bI\b/gi, 'you');
  transformed = transformed.replace(/\bme\b/gi, 'you');
  transformed = transformed.replace(/\bmy\b/gi, 'your');
  transformed = transformed.replace(/\bmyself\b/gi, 'yourself');

  // Trim and capitalize first letter
  transformed = transformed.trim();
  if (transformed.length > 0) {
    transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
  }

  return transformed;
}

// ============================================================================
// ADD REMINDER
// ============================================================================

export async function addReminderVoice(
  reminderText: string,
  userId: string,
  time?: string,
  onNavigate?: (path: string) => void,
  onReminderCreated?: (reminder: Reminder) => void
): Promise<ReminderCreationResult> {
  try {
    console.log('📌 [REMINDER-VOICE] Starting reminder creation');
    console.log('📌 [REMINDER-VOICE] Input - reminderText:', reminderText, 'userId:', userId, 'time:', time);

    if (!reminderText || reminderText.trim().length === 0) {
      console.error('📌 [REMINDER-VOICE] Empty reminder text');
      return {
        success: false,
        message: 'Reminder text cannot be empty',
        error: 'Empty reminder',
      };
    }

    if (!userId || userId.trim().length === 0) {
      console.error('📌 [REMINDER-VOICE] Missing userId');
      return {
        success: false,
        message: 'User ID is required',
        error: 'Missing userId',
      };
    }

    // Transform reminder text from first-person to second-person
    const transformedText = transformReminderText(reminderText);
    console.log(`📌 [REMINDER-TRANSFORM] Original: "${reminderText}" → Transformed: "${transformedText}"`);

    // Convert to full ISO timestamp
    const reminderTime = convertToISOTimestamp(reminderText, time);
    console.log('📌 [REMINDER-VOICE] Converted timestamp:', reminderTime);

    console.log('📌 [REMINDER-VOICE] Creating reminder with data:', {
      title: transformedText,
      reminder_time: reminderTime,
      userId: userId,
      status: 'pending',
    });

    const response = await fetch('/api/reminders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: transformedText,
        description: '',
        reminder_time: reminderTime,
        userId,
        status: 'pending',
        is_recurring: false,
      }),
    });

    console.log('📌 [REMINDER-VOICE] API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📌 [REMINDER-VOICE] Reminder creation failed:', response.status, errorText);
      throw new Error(`Reminder creation failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📌 [REMINDER-VOICE] Reminder creation response:', JSON.stringify(data));

    if (!data.success) {
      console.error('📌 [REMINDER-VOICE] API returned success=false:', data.error);
      return {
        success: false,
        message: 'Failed to create reminder',
        error: data.error,
      };
    }

    console.log('📌 [REMINDER-VOICE] Reminder created successfully:', data.data?.reminder_id);
    console.log('📌 [REMINDER-VOICE] Created reminder data:', JSON.stringify(data.data));

    // Optimistically update UI with the new reminder
    if (onReminderCreated && data.data) {
      console.log('📌 [REMINDER-VOICE] Calling onReminderCreated callback with reminder data');
      onReminderCreated(data.data);
    }

    // Provide voice feedback before navigation
    try {
      const { speak } = await import('@/lib/voice/lara-assistant');
      console.log('📌 [REMINDER-VOICE] Providing voice feedback: "Reminder added"');
      speak('Reminder added', true).catch(err => console.log('📌 [REMINDER-VOICE] TTS error (non-critical):', err));
    } catch (error) {
      console.log('📌 [REMINDER-VOICE] Could not provide voice feedback:', error);
    }

    // Navigate to reminders page (without refresh parameter - UI already updated)
    if (onNavigate) {
      console.log('📌 [REMINDER-VOICE] Navigating to reminders page...');
      onNavigate('/reminders');
      console.log('📌 [REMINDER-VOICE] Navigation callback executed');
    } else {
      console.warn('📌 [REMINDER-VOICE] No onNavigate callback provided - reminder created but not navigating');
    }

    return {
      success: true,
      reminder: data.data,
      message: `Reminder "${transformedText}" set${time ? ` for ${time}` : ''}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('📌 [REMINDER-VOICE] Reminder creation error:', error);

    return {
      success: false,
      message: 'Failed to add reminder',
      error: errorMessage,
    };
  }
}

// ============================================================================
// GET REMINDERS
// ============================================================================

export async function getRemindersVoice(userId: string): Promise<Reminder[]> {
  try {
    const response = await fetch(`/api/reminders?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch reminders: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Failed to fetch reminders:', data.error);
      return [];
    }

    // API returns data.data (array of reminders), not data.reminders
    return data.data || [];
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
}

// ============================================================================
// COMPLETE REMINDER
// ============================================================================

export async function completeReminderVoice(
  reminderId: string,
  userId: string
): Promise<ReminderCreationResult> {
  try {
    const response = await fetch(`/api/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed: true,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Reminder update failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      reminder: data.reminder,
      message: 'Reminder marked as complete',
      error: data.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reminder completion error:', error);

    return {
      success: false,
      message: 'Failed to complete reminder',
      error: errorMessage,
    };
  }
}

// ============================================================================
// DELETE REMINDER
// ============================================================================

export async function deleteReminderVoice(
  reminderId: string,
  userId: string
): Promise<ReminderCreationResult> {
  try {
    const response = await fetch(`/api/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Reminder deletion failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      message: 'Reminder deleted',
      error: data.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reminder deletion error:', error);

    return {
      success: false,
      message: 'Failed to delete reminder',
      error: errorMessage,
    };
  }
}

// ============================================================================
// VOICE REMINDER SUMMARY
// ============================================================================

export async function getReminderSummaryVoice(userId: string): Promise<string> {
  try {
    const reminders = await getRemindersVoice(userId);

    if (reminders.length === 0) {
      return 'You have no reminders.';
    }

    // Use status field from database (pending/sent/dismissed)
    const completedCount = reminders.filter((r) => r.status === 'sent' || r.status === 'dismissed').length;
    const pendingCount = reminders.length - completedCount;

    let summary = `You have ${reminders.length} reminders. `;
    summary += `${pendingCount} pending and ${completedCount} completed. `;

    if (pendingCount > 0) {
      const pendingReminders = reminders.filter((r) => r.status === 'pending').slice(0, 3);
      summary += `Your pending reminders are: ${pendingReminders.map((r) => r.title).join(', ')}.`;
    }

    return summary;
  } catch (error) {
    console.error('Error getting reminder summary:', error);
    return 'Failed to get reminder summary.';
  }
}

