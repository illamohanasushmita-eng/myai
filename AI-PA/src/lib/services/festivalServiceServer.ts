// ============================================================================
// Festival Service (Server-Side)
// ============================================================================
// Server-side only festival service with service role key
// Used by API routes to bypass RLS
// ============================================================================

import { supabaseServer } from '@/lib/supabaseServer';
import type {
  FestivalEvent,
  AINotification,
  UserFestivalPreferences,
  CreateFestivalEventInput,
  UpdateFestivalEventInput,
  CreateAINotificationInput,
  UpdateUserFestivalPreferencesInput,
  FestivalFilters,
  NotificationFilters,
  FestivalEventWithDaysUntil,
} from '@/lib/types/festival';

// ============================================================================
// FESTIVAL EVENTS
// ============================================================================

/**
 * Get upcoming festivals for a user
 */
export async function getUpcomingFestivals(
  userId: string,
  daysAhead: number = 30,
  country: string = 'IN'
): Promise<FestivalEventWithDaysUntil[]> {
  console.log(`🎉 [SERVER] Fetching upcoming festivals for user ${userId}`);

  const { data, error } = await supabaseServer.rpc('get_upcoming_festivals', {
    p_user_id: userId,
    p_days_ahead: daysAhead,
    p_country: country,
  });

  if (error) {
    console.error('❌ [SERVER] Error fetching upcoming festivals:', error);
    throw new Error(`Failed to fetch upcoming festivals: ${error.message}`);
  }

  console.log(`✅ [SERVER] Found ${data?.length || 0} upcoming festivals`);
  return data || [];
}

/**
 * Get all festivals with filters
 */
export async function getFestivals(
  userId: string,
  filters?: FestivalFilters
): Promise<FestivalEvent[]> {
  console.log('🎉 [SERVER] Fetching festivals with filters:', filters);

  let query = supabaseServer
    .from('festival_events')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('event_date', { ascending: true });

  if (filters?.country) {
    query = query.eq('country', filters.country);
  }

  if (filters?.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  if (filters?.startDate) {
    query = query.gte('event_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('event_date', filters.endDate);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  if (filters?.reminderEnabled !== undefined) {
    query = query.eq('reminder_enabled', filters.reminderEnabled);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [SERVER] Error fetching festivals:', error);
    throw new Error(`Failed to fetch festivals: ${error.message}`);
  }

  console.log(`✅ [SERVER] Found ${data?.length || 0} festivals`);
  return data || [];
}

/**
 * Create a custom festival event
 */
export async function createFestivalEvent(
  userId: string,
  input: CreateFestivalEventInput
): Promise<FestivalEvent> {
  console.log('🎉 [SERVER] Creating festival event:', input);

  const { data, error } = await supabaseServer
    .from('festival_events')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      event_date: input.event_date,
      category: input.category,
      country: input.country || 'IN',
      is_active: input.is_active !== false,
      reminder_enabled: input.reminder_enabled || false,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error creating festival event:', error);
    throw new Error(`Failed to create festival event: ${error.message}`);
  }

  console.log('✅ [SERVER] Festival event created:', data);
  return data as FestivalEvent;
}

/**
 * Update a festival event
 */
export async function updateFestivalEvent(
  userId: string,
  eventId: string,
  input: UpdateFestivalEventInput
): Promise<FestivalEvent> {
  console.log(`🎉 [SERVER] Updating festival event ${eventId}:`, input);

  const { data, error } = await supabaseServer
    .from('festival_events')
    .update(input)
    .eq('id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error updating festival event:', error);
    throw new Error(`Failed to update festival event: ${error.message}`);
  }

  console.log('✅ [SERVER] Festival event updated:', data);
  return data as FestivalEvent;
}

/**
 * Delete a festival event
 */
export async function deleteFestivalEvent(
  userId: string,
  eventId: string
): Promise<void> {
  console.log(`🎉 [SERVER] Deleting festival event ${eventId}`);

  const { error } = await supabaseServer
    .from('festival_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ [SERVER] Error deleting festival event:', error);
    throw new Error(`Failed to delete festival event: ${error.message}`);
  }

  console.log('✅ [SERVER] Festival event deleted');
}

/**
 * Toggle reminder for a festival
 */
export async function toggleFestivalReminder(
  userId: string,
  eventId: string,
  enabled: boolean
): Promise<FestivalEvent> {
  console.log(`🔔 [SERVER] Toggling reminder for festival ${eventId}: ${enabled}`);

  const { data, error } = await supabaseServer
    .from('festival_events')
    .update({ reminder_enabled: enabled })
    .eq('id', eventId)
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error toggling festival reminder:', error);
    throw new Error(`Failed to toggle festival reminder: ${error.message}`);
  }

  console.log('✅ [SERVER] Festival reminder toggled');
  return data as FestivalEvent;
}

// ============================================================================
// AI NOTIFICATIONS
// ============================================================================

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  filters?: NotificationFilters
): Promise<AINotification[]> {
  console.log('🔔 [SERVER] Fetching notifications for user:', userId);

  let query = supabaseServer
    .from('ai_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters?.type && filters.type.length > 0) {
    query = query.in('notification_type', filters.type);
  }

  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [SERVER] Error fetching notifications:', error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  console.log(`✅ [SERVER] Found ${data?.length || 0} notifications`);
  return data || [];
}

/**
 * Create a notification
 */
export async function createNotification(
  input: CreateAINotificationInput
): Promise<AINotification> {
  console.log('🔔 [SERVER] Creating notification:', input);

  const { data, error } = await supabaseServer
    .from('ai_notifications')
    .insert({
      user_id: input.user_id,
      notification_type: input.notification_type,
      title: input.title,
      message: input.message,
      ai_prompt: input.ai_prompt || null,
      voice_text: input.voice_text || null,
      festival_event_id: input.festival_event_id || null,
      scheduled_for: input.scheduled_for || new Date().toISOString(),
      priority: input.priority || 'normal',
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error creating notification:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  console.log('✅ [SERVER] Notification created:', data);
  return data as AINotification;
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(
  userId: string,
  notificationId: string,
  status: 'sent' | 'read' | 'dismissed' | 'actioned'
): Promise<AINotification> {
  console.log(`🔔 [SERVER] Updating notification ${notificationId} status to ${status}`);

  const updateData: any = { status };
  
  if (status === 'sent') updateData.sent_at = new Date().toISOString();
  if (status === 'read') updateData.read_at = new Date().toISOString();
  if (status === 'dismissed') updateData.dismissed_at = new Date().toISOString();
  if (status === 'actioned') updateData.actioned_at = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from('ai_notifications')
    .update(updateData)
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ [SERVER] Error updating notification status:', error);
    throw new Error(`Failed to update notification status: ${error.message}`);
  }

  console.log('✅ [SERVER] Notification status updated');
  return data as AINotification;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Get user festival preferences
 */
export async function getUserFestivalPreferences(
  userId: string
): Promise<UserFestivalPreferences | null> {
  console.log('⚙️ [SERVER] Fetching festival preferences for user:', userId);

  const { data, error } = await supabaseServer
    .from('user_festival_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ [SERVER] Error fetching preferences:', error);
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  console.log('✅ [SERVER] Preferences fetched');
  return data as UserFestivalPreferences | null;
}

/**
 * Update user festival preferences
 */
export async function updateUserFestivalPreferences(
  userId: string,
  input: UpdateUserFestivalPreferencesInput
): Promise<UserFestivalPreferences> {
  console.log('⚙️ [SERVER] Updating festival preferences for user:', userId);

  // Try to update first
  const { data: existingData } = await supabaseServer
    .from('user_festival_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  let data, error;

  if (existingData) {
    // Update existing
    const result = await supabaseServer
      .from('user_festival_preferences')
      .update(input)
      .eq('user_id', userId)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Insert new
    const result = await supabaseServer
      .from('user_festival_preferences')
      .insert({ user_id: userId, ...input })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('❌ [SERVER] Error updating preferences:', error);
    throw new Error(`Failed to update preferences: ${error.message}`);
  }

  console.log('✅ [SERVER] Preferences updated');
  return data as UserFestivalPreferences;
}

