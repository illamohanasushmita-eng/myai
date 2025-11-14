-- ============================================================================
-- FESTIVAL EVENTS & AI NOTIFICATIONS SCHEMA
-- ============================================================================
-- This script creates tables for festival/event tracking and AI notifications
-- Run this in your Supabase SQL editor
-- ============================================================================

-- ============================================================================
-- 1. FESTIVAL EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS festival_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  category TEXT CHECK (category IN ('national', 'religious', 'observance', 'cultural', 'custom')),
  country TEXT NOT NULL DEFAULT 'IN',
  is_active BOOLEAN DEFAULT true,
  reminder_enabled BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Metadata from Calendarific API
  api_event_id TEXT,
  event_type TEXT,
  locations TEXT,
  states TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. AI NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('festival', 'event', 'reminder', 'suggestion', 'greeting')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  -- AI-generated content
  ai_prompt TEXT,
  voice_text TEXT,
  voice_url TEXT,
  -- Related entities
  festival_event_id UUID REFERENCES festival_events(id) ON DELETE SET NULL,
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read', 'dismissed', 'actioned')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ,
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  -- User interaction
  user_response TEXT,
  action_taken TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. USER FESTIVAL PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_festival_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Country preferences
  countries TEXT[] DEFAULT ARRAY['IN'],
  -- Category preferences
  enabled_categories TEXT[] DEFAULT ARRAY['national', 'religious', 'observance', 'cultural'],
  -- Notification preferences
  voice_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  days_before_notification INTEGER DEFAULT 1,
  -- Muted festivals (user dismissed these)
  muted_festivals TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. FESTIVAL SYNC LOG TABLE (Track API sync status)
-- ============================================================================
CREATE TABLE IF NOT EXISTS festival_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'manual')),
  country TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed', 'partial')),
  events_fetched INTEGER DEFAULT 0,
  events_stored INTEGER DEFAULT 0,
  error_message TEXT,
  api_response_time_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Festival events indexes
CREATE INDEX IF NOT EXISTS idx_festival_events_date
  ON festival_events(event_date)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_festival_events_country
  ON festival_events(country, event_date)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_festival_events_user
  ON festival_events(user_id, event_date)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_festival_events_category
  ON festival_events(category, event_date)
  WHERE is_active = true;

-- Removed CURRENT_DATE from index predicate (not immutable)
CREATE INDEX IF NOT EXISTS idx_festival_events_upcoming
  ON festival_events(event_date, country, is_active);

-- AI notifications indexes
CREATE INDEX IF NOT EXISTS idx_ai_notifications_user
  ON ai_notifications(user_id, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_ai_notifications_pending
  ON ai_notifications(scheduled_for, status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_ai_notifications_festival
  ON ai_notifications(festival_event_id, user_id)
  WHERE festival_event_id IS NOT NULL;

-- Sync log indexes
CREATE INDEX IF NOT EXISTS idx_festival_sync_log_country_year
  ON festival_sync_log(country, year, status);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Update updated_at timestamp for festival_events
CREATE OR REPLACE FUNCTION update_festival_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_festival_events_updated_at
  BEFORE UPDATE ON festival_events
  FOR EACH ROW
  EXECUTE FUNCTION update_festival_events_updated_at();

-- Update updated_at timestamp for ai_notifications
CREATE OR REPLACE FUNCTION update_ai_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_notifications_updated_at
  BEFORE UPDATE ON ai_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_notifications_updated_at();

-- Update updated_at timestamp for user_festival_preferences
CREATE OR REPLACE FUNCTION update_user_festival_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_festival_preferences_updated_at
  BEFORE UPDATE ON user_festival_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_festival_preferences_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE festival_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_festival_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_sync_log ENABLE ROW LEVEL SECURITY;

-- Festival Events Policies
-- Global events (user_id IS NULL) are visible to all authenticated users
-- User-specific events are only visible to the owner
CREATE POLICY "Users can view global and own festival events"
  ON festival_events
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id IS NULL OR 
      user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own festival events"
  ON festival_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own festival events"
  ON festival_events
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own festival events"
  ON festival_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all festival events (for API sync)
CREATE POLICY "Service role can manage all festival events"
  ON festival_events
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- AI Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON ai_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON ai_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON ai_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON ai_notifications
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- User Festival Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON user_festival_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_festival_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_festival_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Festival Sync Log Policies (read-only for users, full access for service role)
CREATE POLICY "Users can view sync logs"
  ON festival_sync_log
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage sync logs"
  ON festival_sync_log
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get upcoming festivals for a user
CREATE OR REPLACE FUNCTION get_upcoming_festivals(
  p_user_id UUID,
  p_days_ahead INTEGER DEFAULT 7,
  p_country TEXT DEFAULT 'IN'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  event_date DATE,
  category TEXT,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.id,
    fe.name,
    fe.description,
    fe.event_date,
    fe.category,
    (fe.event_date - CURRENT_DATE)::INTEGER as days_until
  FROM festival_events fe
  WHERE fe.is_active = true
    AND fe.country = p_country
    AND fe.event_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    AND (fe.user_id IS NULL OR fe.user_id = p_user_id)
  ORDER BY fe.event_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA / COMMENTS
-- ============================================================================

COMMENT ON TABLE festival_events IS 'Stores festival and event data from Calendarific API and user-added events';
COMMENT ON TABLE ai_notifications IS 'Stores AI-generated notifications for festivals and events';
COMMENT ON TABLE user_festival_preferences IS 'Stores user preferences for festival notifications';
COMMENT ON TABLE festival_sync_log IS 'Tracks API sync operations for monitoring and debugging';

