// ============================================================================
// Festival Service (Client-Side)
// ============================================================================
// Client-side festival service
// Calls API routes instead of direct database access
// ============================================================================

import type {
  FestivalEvent,
  AINotification,
  UserFestivalPreferences,
  CreateFestivalEventInput,
  UpdateFestivalEventInput,
  UpdateUserFestivalPreferencesInput,
  FestivalFilters,
  NotificationFilters,
  FestivalEventWithDaysUntil,
  FestivalAPIResponse,
} from '@/lib/types/festival';

// ============================================================================
// FESTIVAL EVENTS
// ============================================================================

/**
 * Get upcoming festivals
 */
export async function getUpcomingFestivals(
  userId: string,
  daysAhead: number = 30,
  country: string = 'IN'
): Promise<FestivalEventWithDaysUntil[]> {
  const response = await fetch(
    `/api/festivals/upcoming?userId=${userId}&daysAhead=${daysAhead}&country=${country}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch upcoming festivals');
  }

  const data: FestivalAPIResponse<FestivalEventWithDaysUntil[]> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch upcoming festivals');
  }

  return data.data;
}

/**
 * Get all festivals with filters
 */
export async function getFestivals(
  userId: string,
  filters?: FestivalFilters
): Promise<FestivalEvent[]> {
  const params = new URLSearchParams({ userId });
  
  if (filters?.country) params.append('country', filters.country);
  if (filters?.category) params.append('category', filters.category.join(','));
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.reminderEnabled !== undefined) params.append('reminderEnabled', String(filters.reminderEnabled));

  const response = await fetch(`/api/festivals/list?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch festivals');
  }

  const data: FestivalAPIResponse<FestivalEvent[]> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch festivals');
  }

  return data.data;
}

/**
 * Create a custom festival event
 */
export async function createFestivalEvent(
  userId: string,
  input: CreateFestivalEventInput
): Promise<FestivalEvent> {
  const response = await fetch('/api/festivals/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...input }),
  });

  if (!response.ok) {
    throw new Error('Failed to create festival event');
  }

  const data: FestivalAPIResponse<FestivalEvent> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to create festival event');
  }

  return data.data;
}

/**
 * Update a festival event
 */
export async function updateFestivalEvent(
  userId: string,
  eventId: string,
  input: UpdateFestivalEventInput
): Promise<FestivalEvent> {
  const response = await fetch('/api/festivals/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventId, ...input }),
  });

  if (!response.ok) {
    throw new Error('Failed to update festival event');
  }

  const data: FestivalAPIResponse<FestivalEvent> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update festival event');
  }

  return data.data;
}

/**
 * Delete a festival event
 */
export async function deleteFestivalEvent(
  userId: string,
  eventId: string
): Promise<void> {
  const response = await fetch('/api/festivals/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete festival event');
  }

  const data: FestivalAPIResponse<void> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete festival event');
  }
}

/**
 * Toggle reminder for a festival
 */
export async function toggleFestivalReminder(
  userId: string,
  eventId: string,
  enabled: boolean
): Promise<FestivalEvent> {
  const response = await fetch('/api/festivals/toggle-reminder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventId, enabled }),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle festival reminder');
  }

  const data: FestivalAPIResponse<FestivalEvent> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to toggle festival reminder');
  }

  return data.data;
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
  const params = new URLSearchParams({ userId });
  
  if (filters?.status) params.append('status', filters.status.join(','));
  if (filters?.type) params.append('type', filters.type.join(','));
  if (filters?.priority) params.append('priority', filters.priority.join(','));

  const response = await fetch(`/api/festivals/notifications?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  const data: FestivalAPIResponse<AINotification[]> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch notifications');
  }

  return data.data;
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(
  userId: string,
  notificationId: string,
  status: 'sent' | 'read' | 'dismissed' | 'actioned'
): Promise<AINotification> {
  const response = await fetch('/api/festivals/notifications/update-status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, notificationId, status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update notification status');
  }

  const data: FestivalAPIResponse<AINotification> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update notification status');
  }

  return data.data;
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
  const response = await fetch(`/api/festivals/preferences?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch festival preferences');
  }

  const data: FestivalAPIResponse<UserFestivalPreferences | null> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch festival preferences');
  }

  return data.data || null;
}

/**
 * Update user festival preferences
 */
export async function updateUserFestivalPreferences(
  userId: string,
  input: UpdateUserFestivalPreferencesInput
): Promise<UserFestivalPreferences> {
  const response = await fetch('/api/festivals/preferences/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...input }),
  });

  if (!response.ok) {
    throw new Error('Failed to update festival preferences');
  }

  const data: FestivalAPIResponse<UserFestivalPreferences> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update festival preferences');
  }

  return data.data;
}

/**
 * Trigger manual festival sync
 */
export async function syncFestivals(
  country: string = 'IN',
  year?: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/festivals/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country, year: year || new Date().getFullYear() }),
  });

  if (!response.ok) {
    throw new Error('Failed to sync festivals');
  }

  const data = await response.json();
  return data;
}

