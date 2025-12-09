import { Reminder } from '@/lib/types/database';

/**
 * Create a reminder via API route (uses service role key on backend)
 * This bypasses RLS policies and ensures data is stored correctly
 */
export async function createReminderViaAPI(
  userId: string,
  reminderData: {
    title: string;
    description?: string;
    reminder_time: string;
    reminder_type?: string;
    status?: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
  }
): Promise<Reminder> {
  try {
    console.log('[REMINDER-SERVICE] Creating reminder via API for userId:', userId);

    const response = await fetch('/api/reminders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...reminderData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[REMINDER-SERVICE] Reminder creation failed:', {
        status: response.status,
        error: result.error,
        details: result.details,
      });

      // Provide user-friendly error messages
      if (response.status === 400) {
        if (Array.isArray(result.details)) {
          throw new Error(`Validation error: ${result.details.join(', ')}`);
        }
        // Check if it's a user profile not found error
        if (result.error && result.error.includes('User profile not found')) {
          throw new Error('Your user profile was not created. Please sign up again or contact support.');
        }
        throw new Error(result.error || 'Invalid input');
      }

      if (response.status === 409) {
        throw new Error(result.error || 'Reminder already exists');
      }

      throw new Error(result.error || 'Failed to create reminder');
    }

    console.log('[REMINDER-SERVICE] Reminder created successfully:', {
      reminder_id: result.data?.reminder_id,
      title: result.data?.title,
    });

    return result.data;
  } catch (error) {
    console.error('[REMINDER-SERVICE] Error creating reminder:', error);
    throw error;
  }
}

/**
 * Get all reminders for a user
 */
export async function getRemindersList(userId: string): Promise<Reminder[]> {
  try {
    console.log('[REMINDER-SERVICE] Fetching reminders for userId:', userId);

    const response = await fetch(`/api/reminders?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[REMINDER-SERVICE] Error fetching reminders:', error);
    throw error;
  }
}

