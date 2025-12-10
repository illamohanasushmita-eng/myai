-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up RLS policies
-- This allows users to only access their own data
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage users"
ON users FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated insert"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SETTINGS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage settings"
ON settings FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings"
ON settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own settings
CREATE POLICY "Users can view their own settings"
ON settings FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings"
ON settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage tasks"
ON tasks FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- REMINDERS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage reminders"
ON reminders FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own reminders"
ON reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reminders"
ON reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
ON reminders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
ON reminders FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- HEALTH RECORDS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage health records"
ON health_records FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own health records"
ON health_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health records"
ON health_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
ON health_records FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records"
ON health_records FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- SYMPTOMS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage symptoms"
ON symptoms FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own symptoms"
ON symptoms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own symptoms"
ON symptoms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms"
ON symptoms FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms"
ON symptoms FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- MEDICATIONS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage medications"
ON medications FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own medications"
ON medications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own medications"
ON medications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
ON medications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
ON medications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage appointments"
ON appointments FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own appointments"
ON appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
ON appointments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
ON appointments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- HABITS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage habits"
ON habits FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits"
ON habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON habits FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- HABIT LOGS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage habit logs"
ON habit_logs FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own habit logs"
ON habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit logs"
ON habit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
ON habit_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
ON habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- GROWTH GOALS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage growth goals"
ON growth_goals FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own growth goals"
ON growth_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own growth goals"
ON growth_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth goals"
ON growth_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own growth goals"
ON growth_goals FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- LEARNING MODULES TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage learning modules"
ON learning_modules FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own learning modules"
ON learning_modules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own learning modules"
ON learning_modules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning modules"
ON learning_modules FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning modules"
ON learning_modules FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- VEHICLES TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage vehicles"
ON vehicles FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own vehicles"
ON vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vehicles"
ON vehicles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
ON vehicles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
ON vehicles FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- SMART DEVICES TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage smart devices"
ON smart_devices FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own smart devices"
ON smart_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own smart devices"
ON smart_devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart devices"
ON smart_devices FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart devices"
ON smart_devices FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PROFESSIONAL NOTES TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage professional notes"
ON professional_notes FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own professional notes"
ON professional_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own professional notes"
ON professional_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own professional notes"
ON professional_notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own professional notes"
ON professional_notes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage notifications"
ON notifications FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- AI LOGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can insert their own AI logs"
ON ai_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI logs"
ON ai_logs FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- INSIGHTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can insert their own insights"
ON insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights"
ON insights FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES SETUP COMPLETE
-- ============================================================================
-- All RLS policies have been created successfully!
-- Users can now only access their own data
-- ============================================================================
