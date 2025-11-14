// ============================================================================
// Festival Events Type Definitions
// ============================================================================

export interface FestivalEvent {
  id: string;
  name: string;
  description: string | null;
  event_date: string; // ISO date string
  category: 'national' | 'religious' | 'observance' | 'cultural' | 'custom';
  country: string;
  is_active: boolean;
  reminder_enabled: boolean;
  user_id: string | null;
  api_event_id: string | null;
  event_type: string | null;
  locations: string | null;
  states: string | null;
  created_at: string;
  updated_at: string;
}

export interface AINotification {
  id: string;
  user_id: string;
  notification_type: 'festival' | 'event' | 'reminder' | 'suggestion' | 'greeting';
  title: string;
  message: string;
  ai_prompt: string | null;
  voice_text: string | null;
  voice_url: string | null;
  festival_event_id: string | null;
  status: 'pending' | 'sent' | 'read' | 'dismissed' | 'actioned';
  sent_at: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  actioned_at: string | null;
  scheduled_for: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  user_response: string | null;
  action_taken: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFestivalPreferences {
  id: string;
  user_id: string;
  countries: string[];
  enabled_categories: string[];
  voice_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  notification_time: string; // HH:MM:SS format
  days_before_notification: number;
  muted_festivals: string[];
  created_at: string;
  updated_at: string;
}

export interface FestivalSyncLog {
  id: string;
  sync_type: 'full' | 'incremental' | 'manual';
  country: string;
  year: number;
  status: 'started' | 'success' | 'failed' | 'partial';
  events_fetched: number;
  events_stored: number;
  error_message: string | null;
  api_response_time_ms: number | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// Input types for creating/updating
export interface CreateFestivalEventInput {
  name: string;
  description?: string;
  event_date: string;
  category: 'national' | 'religious' | 'observance' | 'cultural' | 'custom';
  country?: string;
  is_active?: boolean;
  reminder_enabled?: boolean;
}

export interface UpdateFestivalEventInput {
  name?: string;
  description?: string;
  event_date?: string;
  category?: 'national' | 'religious' | 'observance' | 'cultural' | 'custom';
  is_active?: boolean;
  reminder_enabled?: boolean;
}

export interface CreateAINotificationInput {
  user_id: string;
  notification_type: 'festival' | 'event' | 'reminder' | 'suggestion' | 'greeting';
  title: string;
  message: string;
  ai_prompt?: string;
  voice_text?: string;
  festival_event_id?: string;
  scheduled_for?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateUserFestivalPreferencesInput {
  countries?: string[];
  enabled_categories?: string[];
  voice_notifications_enabled?: boolean;
  push_notifications_enabled?: boolean;
  notification_time?: string;
  days_before_notification?: number;
  muted_festivals?: string[];
}

// Response types
export interface FestivalEventWithDaysUntil extends FestivalEvent {
  days_until: number;
}

export interface FestivalNotificationResponse {
  notification: AINotification;
  festival: FestivalEvent | null;
}

// API response types
export interface FestivalAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SyncFestivalsResponse {
  success: boolean;
  message: string;
  data: {
    country: string;
    year: number;
    events_fetched: number;
    events_stored: number;
    api_response_time_ms: number;
  };
}

// Calendar integration types
export interface CalendarFestivalEvent {
  id: string;
  title: string;
  date: Date;
  category: string;
  description?: string;
  isFestival: true;
  reminderEnabled: boolean;
}

// Filter types
export interface FestivalFilters {
  country?: string;
  category?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  reminderEnabled?: boolean;
}

export interface NotificationFilters {
  status?: string[];
  type?: string[];
  priority?: string[];
  startDate?: string;
  endDate?: string;
}

