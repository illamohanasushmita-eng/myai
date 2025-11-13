-- ============================================================================
-- BILLING REMINDERS TABLE SCHEMA
-- ============================================================================
-- This schema creates a comprehensive billing management system for Lara AI Assistant
-- Features: Monthly bills tracking, voice reminders, payment status, recurring bills
-- ============================================================================

-- Drop existing table if exists (for development only)
-- DROP TABLE IF EXISTS billing_reminders CASCADE;

-- Create billing_reminders table
CREATE TABLE IF NOT EXISTS billing_reminders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bill Information
  bill_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'phone_emi',
    'electricity',
    'water',
    'internet',
    'gas',
    'home_loan',
    'vehicle_emi',
    'ott_subscription',
    'insurance',
    'credit_card',
    'mobile_recharge',
    'rent',
    'other'
  )),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
  
  -- Due Date Information
  due_date DATE NOT NULL,
  next_due_date DATE,
  
  -- Recurrence Settings
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'completed')),
  
  -- Reminder Settings
  reminder_days INTEGER DEFAULT 10 CHECK (reminder_days >= 0 AND reminder_days <= 30),
  reminder_enabled BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  
  -- Payment History
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  
  -- Additional Information
  notes TEXT,
  auto_pay BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_billing_user_id 
  ON billing_reminders(user_id);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_billing_user_status 
  ON billing_reminders(user_id, status);

-- Index for due date queries (only for pending bills)
CREATE INDEX IF NOT EXISTS idx_billing_due_date 
  ON billing_reminders(due_date) 
  WHERE status = 'pending';

-- Index for reminder queries
CREATE INDEX IF NOT EXISTS idx_billing_reminders 
  ON billing_reminders(user_id, status, due_date, reminder_enabled)
  WHERE status = 'pending' AND reminder_enabled = true;

-- Index for category-based analytics
CREATE INDEX IF NOT EXISTS idx_billing_category 
  ON billing_reminders(user_id, category, status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE billing_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own bills
CREATE POLICY "Users can view own bills" 
  ON billing_reminders
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert only their own bills
CREATE POLICY "Users can insert own bills" 
  ON billing_reminders
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own bills
CREATE POLICY "Users can update own bills" 
  ON billing_reminders
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete only their own bills
CREATE POLICY "Users can delete own bills" 
  ON billing_reminders
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on row modification
DROP TRIGGER IF EXISTS trigger_update_billing_timestamp ON billing_reminders;
CREATE TRIGGER trigger_update_billing_timestamp
  BEFORE UPDATE ON billing_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

-- Function: Calculate next due date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  current_due_date DATE,
  bill_frequency TEXT
)
RETURNS DATE AS $$
BEGIN
  CASE bill_frequency
    WHEN 'monthly' THEN
      RETURN current_due_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN current_due_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      RETURN current_due_date + INTERVAL '1 year';
    WHEN 'one-time' THEN
      RETURN NULL; -- No next due date for one-time bills
    ELSE
      RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update status to overdue
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
  UPDATE billing_reminders
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark bill as paid and calculate next due date
CREATE OR REPLACE FUNCTION mark_bill_paid(bill_id UUID)
RETURNS billing_reminders AS $$
DECLARE
  updated_bill billing_reminders;
BEGIN
  UPDATE billing_reminders
  SET 
    status = 'paid',
    paid_at = NOW(),
    next_due_date = calculate_next_due_date(due_date, frequency),
    last_notified_at = NULL
  WHERE id = bill_id
  RETURNING * INTO updated_bill;
  
  -- If one-time bill, mark as completed
  IF updated_bill.frequency = 'one-time' THEN
    UPDATE billing_reminders
    SET status = 'completed'
    WHERE id = bill_id
    RETURNING * INTO updated_bill;
  END IF;
  
  RETURN updated_bill;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Upcoming bills (next 30 days)
CREATE OR REPLACE VIEW upcoming_bills AS
SELECT 
  br.*,
  (br.due_date - CURRENT_DATE) AS days_until_due,
  CASE 
    WHEN (br.due_date - CURRENT_DATE) < 0 THEN 'overdue'
    WHEN (br.due_date - CURRENT_DATE) <= 3 THEN 'urgent'
    WHEN (br.due_date - CURRENT_DATE) <= 7 THEN 'soon'
    ELSE 'upcoming'
  END AS urgency_level
FROM billing_reminders br
WHERE br.status = 'pending'
  AND br.due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY br.due_date ASC;

-- View: Monthly bill summary by category
CREATE OR REPLACE VIEW monthly_bill_summary AS
SELECT 
  user_id,
  category,
  COUNT(*) AS bill_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount,
  MIN(amount) AS min_amount,
  MAX(amount) AS max_amount
FROM billing_reminders
WHERE status IN ('pending', 'overdue')
  AND frequency = 'monthly'
GROUP BY user_id, category;

-- ============================================================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================================================

-- Uncomment to insert sample data
/*
INSERT INTO billing_reminders (user_id, bill_name, category, amount, due_date, frequency, reminder_days)
VALUES 
  ('your-user-id-here', 'Electricity Bill', 'electricity', 1200.00, '2025-11-25', 'monthly', 10),
  ('your-user-id-here', 'Wi-Fi Bill', 'internet', 799.00, '2025-11-20', 'monthly', 5),
  ('your-user-id-here', 'Netflix Subscription', 'ott_subscription', 649.00, '2025-11-15', 'monthly', 3),
  ('your-user-id-here', 'Home Loan EMI', 'home_loan', 25000.00, '2025-11-05', 'monthly', 7);
*/

-- ============================================================================
-- DEPLOYMENT NOTES
-- ============================================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify RLS policies are enabled
-- 3. Test with sample data
-- 4. Set up cron job for update_overdue_bills() function
-- 5. Grant necessary permissions to authenticated users
-- ============================================================================

