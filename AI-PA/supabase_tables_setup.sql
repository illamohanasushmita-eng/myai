-- ============================================================================
-- SUPABASE DATABASE SCHEMA FOR AI-PA APPLICATION
-- ============================================================================
-- This script creates all necessary tables for the AI-PA application
-- Run this in your Supabase SQL editor
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    category TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
    reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP NOT NULL,
    reminder_type TEXT,
    status TEXT DEFAULT 'pending',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS health_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    water_intake INTEGER,
    steps INTEGER,
    sleep_hours DECIMAL(4, 2),
    sleep_quality TEXT,
    weight DECIMAL(6, 2),
    blood_pressure TEXT,
    heart_rate INTEGER,
    blood_sugar INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. SYMPTOMS TABLE
CREATE TABLE IF NOT EXISTS symptoms (
    symptom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    symptom_name TEXT NOT NULL,
    severity TEXT,
    description TEXT,
    logged_date TIMESTAMP DEFAULT NOW(),
    duration_hours INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS medications (
    medication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    time_of_day TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    side_effects TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    doctor_name TEXT,
    clinic_name TEXT,
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. PERSONAL GROWTH GOALS TABLE
CREATE TABLE IF NOT EXISTS growth_goals (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. HABITS TABLE
CREATE TABLE IF NOT EXISTS habits (
    habit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    habit_name TEXT NOT NULL,
    description TEXT,
    frequency TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS habit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(habit_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. LEARNING MODULES TABLE
CREATE TABLE IF NOT EXISTS learning_modules (
    module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    progress_percentage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    license_plate TEXT,
    vin TEXT,
    mileage INTEGER,
    fuel_type TEXT,
    color TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. MAINTENANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS maintenance_logs (
    maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2),
    mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
    route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    distance_km DECIMAL(8, 2),
    estimated_time_minutes INTEGER,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 15. SMART HOME DEVICES TABLE
CREATE TABLE IF NOT EXISTS smart_devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 16. DEVICE LOGS TABLE
CREATE TABLE IF NOT EXISTS device_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES smart_devices(device_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    status TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 17. PROFESSIONAL NOTES TABLE
CREATE TABLE IF NOT EXISTS professional_notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 18. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    voice_input_enabled BOOLEAN DEFAULT FALSE,
    data_sharing BOOLEAN DEFAULT FALSE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 19. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    notification_type TEXT,
    scheduled_time TIMESTAMP,
    status TEXT DEFAULT 'pending',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 20. AI LOGS TABLE
CREATE TABLE IF NOT EXISTS ai_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT,
    intent TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 21. INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS insights (
    insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_time ON reminders(reminder_time);

CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_date ON health_records(record_date);

CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_date ON symptoms(logged_date);

CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(is_active);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(log_date);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_maintenance_vehicle_id ON maintenance_logs(vehicle_id);

CREATE INDEX idx_smart_devices_user_id ON smart_devices(user_id);
CREATE INDEX idx_device_logs_device_id ON device_logs(device_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX idx_insights_user_id ON insights(user_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
-- All tables have been created successfully!
-- Next steps:
-- 1. Set up Row Level Security (RLS) policies in Supabase dashboard
-- 2. Update your TypeScript types in src/lib/types/database.ts
-- 3. Update your service files to match the new schema
-- ============================================================================

