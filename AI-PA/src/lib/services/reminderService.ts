import { supabase } from '@/lib/supabaseClient';
import { Reminder } from '@/lib/types/database';

// Fetch all reminders for a user
export async function getUserReminders(userId: string): Promise<Reminder[]> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
}

// Fetch a single reminder
export async function getReminder(reminderId: string): Promise<Reminder | null> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('reminder_id', reminderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reminder:', error);
    throw error;
  }
}

// Create a new reminder
export async function createReminder(
  userId: string,
  reminderData: Omit<Reminder, 'reminder_id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Reminder> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          user_id: userId,
          ...reminderData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

// Update a reminder
export async function updateReminder(
  reminderId: string,
  updates: Partial<Reminder>
): Promise<Reminder> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('reminder_id', reminderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
}

// Delete a reminder
export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('reminder_id', reminderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
}

// Get active reminders
export async function getActiveReminders(userId: string): Promise<Reminder[]> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('reminder_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active reminders:', error);
    throw error;
  }
}

// Get recurring reminders
export async function getRecurringReminders(userId: string): Promise<Reminder[]> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .order('reminder_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recurring reminders:', error);
    throw error;
  }
}

