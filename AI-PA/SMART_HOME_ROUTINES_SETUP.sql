-- ============================================================================
-- SMART HOME ROUTINES TABLE SETUP
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to create the routines table
-- ============================================================================

-- 1. SMART HOME ROUTINES TABLE
CREATE TABLE IF NOT EXISTS smart_home_routines (
    routine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    routine_name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'home',
    color TEXT DEFAULT 'blue',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ROUTINE ACTIONS TABLE (stores which devices are controlled by each routine)
CREATE TABLE IF NOT EXISTS routine_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES smart_home_routines(routine_id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES smart_devices(device_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'turn_on', 'turn_off', 'set_brightness', 'set_temperature'
    action_value TEXT, -- e.g., '75' for brightness, '22' for temperature
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ROUTINE EXECUTION LOGS TABLE (tracks when routines are executed)
CREATE TABLE IF NOT EXISTS routine_execution_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES smart_home_routines(routine_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    executed_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'success', -- 'success', 'failed', 'partial'
    notes TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_smart_home_routines_user_id ON smart_home_routines(user_id);
CREATE INDEX idx_smart_home_routines_active ON smart_home_routines(is_active);
CREATE INDEX idx_routine_actions_routine_id ON routine_actions(routine_id);
CREATE INDEX idx_routine_actions_device_id ON routine_actions(device_id);
CREATE INDEX idx_routine_execution_logs_routine_id ON routine_execution_logs(routine_id);
CREATE INDEX idx_routine_execution_logs_user_id ON routine_execution_logs(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE smart_home_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_execution_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own routines
CREATE POLICY "Users can view their own routines"
ON smart_home_routines FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can only create routines for themselves
CREATE POLICY "Users can create their own routines"
ON smart_home_routines FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only update their own routines
CREATE POLICY "Users can update their own routines"
ON smart_home_routines FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can only delete their own routines
CREATE POLICY "Users can delete their own routines"
ON smart_home_routines FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Routine actions policies
CREATE POLICY "Users can view their routine actions"
ON routine_actions FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create routine actions"
ON routine_actions FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update routine actions"
ON routine_actions FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete routine actions"
ON routine_actions FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Routine execution logs policies
CREATE POLICY "Users can view their execution logs"
ON routine_execution_logs FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create execution logs"
ON routine_execution_logs FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
 
-- Uncomment to add sample routines for testing
/*
INSERT INTO smart_home_routines (user_id, routine_name, description, icon, color, is_active)
VALUES 
  ('your-user-id-here', 'Good Morning', 'Turns on lights, sets thermostat', 'wb_sunny', 'orange', true),
  ('your-user-id-here', 'Good Night', 'Turns off all devices', 'bedtime', 'indigo', true),
  ('your-user-id-here', 'Movie Time', 'Dims lights, turns on TV', 'movie', 'red', true);
*/

