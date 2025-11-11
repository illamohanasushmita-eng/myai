# Supabase Tables Setup Guide

## 📋 Overview

This guide explains how to set up all the Supabase tables for your AI-PA application. The SQL script creates 21 tables organized by functionality.

## 🚀 Quick Setup

### Step 1: Copy the SQL Script
Open the file: `supabase_tables_setup.sql`

### Step 2: Run in Supabase
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire SQL script
5. Click **Run**

### Step 3: Verify Tables
Go to **Table Editor** and verify all 21 tables are created.

## 📊 Table Structure

### 1. **Users** (Authentication & Profile)
```
- user_id (UUID, Primary Key)
- email (TEXT, Unique)
- password_hash (TEXT)
- name, phone, avatar_url
- theme, language
- created_at, updated_at, last_login
```

### 2. **Tasks** (Task Management)
```
- task_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, description
- due_date, category
- status (pending/completed)
- priority (low/medium/high)
- ai_generated (Boolean)
- created_at, updated_at
```

### 3. **Reminders** (Reminder Management)
```
- reminder_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, description
- reminder_time (TIMESTAMP)
- reminder_type
- status (pending/sent/dismissed)
- is_recurring, recurrence_pattern
- created_at, updated_at
```

### 4. **Health Records** (Daily Health Metrics)
```
- record_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- record_date (DATE)
- water_intake, steps, sleep_hours
- sleep_quality, weight
- blood_pressure, heart_rate, blood_sugar
- notes
- created_at, updated_at
```

### 5. **Symptoms** (Symptom Tracking)
```
- symptom_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- symptom_name, severity
- description, logged_date
- duration_hours, notes
- created_at
```

### 6. **Medications** (Medication Management)
```
- medication_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- medication_name, dosage, frequency
- time_of_day
- start_date, end_date
- reason, side_effects
- is_active (Boolean)
- created_at, updated_at
```

### 7. **Appointments** (Healthcare Appointments)
```
- appointment_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, doctor_name, clinic_name
- appointment_date (TIMESTAMP)
- duration_minutes, location
- notes, status
- created_at, updated_at
```

### 8. **Growth Goals** (Personal Development)
```
- goal_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, description, category
- target_date, progress_percentage
- status (active/completed/abandoned)
- created_at, updated_at
```

### 9. **Habits** (Habit Tracking)
```
- habit_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- habit_name, description
- frequency, category
- is_active (Boolean)
- created_at, updated_at
```

### 10. **Habit Logs** (Daily Habit Records)
```
- log_id (UUID, Primary Key)
- habit_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- log_date (DATE)
- completed (Boolean)
- notes
- created_at
```

### 11. **Learning Modules** (Educational Content)
```
- module_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, description, category
- progress_percentage
- status (not_started/in_progress/completed)
- created_at, updated_at
```

### 12. **Vehicles** (Vehicle Management)
```
- vehicle_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- make, model, year
- license_plate, vin, mileage
- fuel_type, color
- is_primary (Boolean)
- created_at, updated_at
```

### 13. **Maintenance Logs** (Vehicle Maintenance)
```
- maintenance_id (UUID, Primary Key)
- vehicle_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- maintenance_date (DATE)
- service_type, description
- cost, mileage, notes
- created_at
```

### 14. **Routes** (Favorite Routes)
```
- route_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- start_location, end_location
- distance_km, estimated_time_minutes
- is_favorite (Boolean)
- created_at, updated_at
```

### 15. **Smart Devices** (IoT Devices)
```
- device_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- device_name, device_type
- location, is_active
- status (online/offline)
- created_at, updated_at
```

### 16. **Device Logs** (Device Activity)
```
- log_id (UUID, Primary Key)
- device_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- action, status
- timestamp
```

### 17. **Professional Notes** (Work Notes)
```
- note_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, content
- category, tags
- created_at, updated_at
```

### 18. **Settings** (User Preferences)
```
- setting_id (UUID, Primary Key)
- user_id (UUID, Foreign Key, Unique)
- notifications_enabled, email_notifications
- push_notifications, voice_input_enabled
- data_sharing, theme, language
- created_at, updated_at
```

### 19. **Notifications** (User Notifications)
```
- notification_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title, message
- notification_type
- scheduled_time, status
- is_read (Boolean)
- created_at
```

### 20. **AI Logs** (AI Interaction History)
```
- log_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- query, response
- intent, success
- created_at
```

### 21. **Insights** (Generated Insights)
```
- insight_id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- insight_type, title
- description, data (JSONB)
- created_at
```

## 🔍 Indexes Created

Indexes are automatically created for:
- All `user_id` foreign keys (for fast filtering)
- Status fields (for quick lookups)
- Date fields (for range queries)
- Active/is_active fields (for filtering)

## 🔐 Row Level Security (RLS)

All tables have RLS enabled. You need to create policies in Supabase:

### Example Policy (for tasks table):
```sql
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid()::text = user_id::text);
```

## 📝 TypeScript Types

All types are defined in: `src/lib/types/database.ts`

Updated interfaces include:
- User, Settings
- Task, Reminder
- HealthRecord, Symptom, Medication, Appointment
- GrowthGoal, Habit, HabitLog, LearningModule
- Vehicle, MaintenanceLog, Route
- SmartDevice, DeviceLog
- ProfessionalNote
- Notification, AILog, Insight

## 🛠️ Service Layer Updates

Update your service files to match the new schema:

### Example: taskService.ts
```typescript
export async function getUserTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}
```

## 🔄 Data Migration

If you have existing data:
1. Export data from old tables
2. Transform to match new schema
3. Import into new tables

## ✅ Verification Checklist

- [ ] All 21 tables created
- [ ] All indexes created
- [ ] RLS enabled on all tables
- [ ] TypeScript types updated
- [ ] Service files updated
- [ ] RLS policies configured
- [ ] Test data inserted
- [ ] Queries working

## 🚨 Important Notes

1. **RLS Policies**: Must be configured for security
2. **Foreign Keys**: Cascade delete is enabled
3. **Timestamps**: Automatically set by database
4. **UUIDs**: Generated automatically
5. **Indexes**: Improve query performance

## 📞 Troubleshooting

### Error: "Relation does not exist"
→ Ensure all tables are created by running the SQL script

### Error: "Permission denied"
→ Configure RLS policies in Supabase dashboard

### Error: "Foreign key violation"
→ Ensure parent records exist before inserting child records

## 🎯 Next Steps

1. ✅ Run the SQL script
2. ✅ Verify tables in Supabase
3. ✅ Configure RLS policies
4. ✅ Update service files
5. ✅ Test with sample data
6. ✅ Deploy to production

---

**File**: `supabase_tables_setup.sql`
**Status**: Ready to use
**Last Updated**: 2024

