/**
 * Reminder Automation Module
 * Handles voice-triggered reminder creation and management
 */

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderTime: string;
  completed: boolean;
  createdAt: string;
  userId: string;
}

export interface ReminderCreationResult {
  success: boolean;
  reminder?: Reminder;
  message: string;
  error?: string;
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

// ============================================================================
// ADD REMINDER
// ============================================================================

export async function addReminderVoice(
  reminderText: string,
  userId: string,
  time?: string,
  onNavigate?: (path: string) => void
): Promise<ReminderCreationResult> {
  try {
    if (!reminderText || reminderText.trim().length === 0) {
      return {
        success: false,
        message: 'Reminder text cannot be empty',
        error: 'Empty reminder',
      };
    }

    // Parse time if not provided
    let reminderTime = time;
    if (!reminderTime) {
      reminderTime = parseTimeFromText(reminderText) || new Date().toISOString();
    }

    console.log('📌 [REMINDER-VOICE] Creating reminder:', reminderText, 'for user:', userId, 'at:', reminderTime);

    const response = await fetch('/api/reminders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: reminderText,
        description: '',
        reminder_time: reminderTime,
        userId,
        status: 'pending',
        is_recurring: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📌 [REMINDER-VOICE] Reminder creation failed:', response.status, errorText);
      throw new Error(`Reminder creation failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📌 [REMINDER-VOICE] Reminder creation response:', data);

    if (!data.success) {
      return {
        success: false,
        message: 'Failed to create reminder',
        error: data.error,
      };
    }

    // Navigate to reminders page to show the newly created reminder
    if (onNavigate) {
      console.log('📌 [REMINDER-VOICE] Navigating to reminders page...');
      onNavigate('/reminders');
    }

    return {
      success: true,
      reminder: data.data,
      message: `Reminder "${reminderText}" set${time ? ` for ${time}` : ''}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reminder creation error:', error);

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

    return data.reminders || [];
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

    const completedCount = reminders.filter((r) => r.completed).length;
    const pendingCount = reminders.length - completedCount;

    let summary = `You have ${reminders.length} reminders. `;
    summary += `${pendingCount} pending and ${completedCount} completed. `;

    if (pendingCount > 0) {
      const pendingReminders = reminders.filter((r) => !r.completed).slice(0, 3);
      summary += `Your pending reminders are: ${pendingReminders.map((r) => r.title).join(', ')}.`;
    }

    return summary;
  } catch (error) {
    console.error('Error getting reminder summary:', error);
    return 'Failed to get reminder summary.';
  }
}

