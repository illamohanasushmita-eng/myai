# 🚀 Complete Setup Instructions for Supabase Tables

## 📋 Overview

This document provides step-by-step instructions to set up your Supabase database with all 21 tables for the AI-PA application.

## ✅ Prerequisites

- Supabase account and project created
- Supabase URL and API keys ready
- `.env.local` file configured with Supabase credentials

## 🎯 Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Copy the SQL Script

1. Open file: `supabase_tables_setup.sql` in your project
2. Select all content (Ctrl+A or Cmd+A)
3. Copy the entire script (Ctrl+C or Cmd+C)

### Step 3: Paste and Execute

1. In Supabase SQL Editor, paste the script
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for execution to complete
4. You should see: "Query executed successfully"

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. Verify all 21 tables are listed:
   - users
   - tasks
   - reminders
   - health_records
   - symptoms
   - medications
   - appointments
   - growth_goals
   - habits
   - habit_logs
   - learning_modules
   - vehicles
   - maintenance_logs
   - routes
   - smart_devices
   - device_logs
   - professional_notes
   - settings
   - notifications
   - ai_logs
   - insights

### Step 5: Configure Row Level Security (RLS)

1. Go to **Authentication** → **Policies** in Supabase
2. For each table, create policies:

#### Example: Tasks Table Policies

```sql
-- Policy 1: Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
ON tasks FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Policy 2: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 3: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Policy 4: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid()::text = user_id::text);
```

Repeat similar policies for all other tables.

### Step 6: Update TypeScript Types

✅ Already done! File `src/lib/types/database.ts` is updated with all new types.

### Step 7: Update Service Files

Update your service files to match the new schema. Example:

```typescript
// src/lib/services/taskService.ts
import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/lib/types/database';

export async function getUserTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createTask(
  userId: string,
  taskData: Omit<Task, 'task_id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id: userId, ...taskData }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('task_id', taskId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('task_id', taskId);
  
  if (error) throw error;
}
```

### Step 8: Test the Setup

1. Create a test user in your app
2. Insert test data into a table
3. Verify data appears in Supabase Table Editor
4. Test CRUD operations

## 📊 Table Mapping to Features

| Feature | Tables |
|---------|--------|
| Tasks | tasks |
| Reminders | reminders |
| Healthcare | health_records, symptoms, medications, appointments |
| Personal Growth | growth_goals, habits, habit_logs, learning_modules |
| Automotive | vehicles, maintenance_logs, routes |
| Smart Home | smart_devices, device_logs |
| Professional | professional_notes |
| Settings | settings, notifications |
| AI | ai_logs, insights |

## 🔐 Security Setup

### Enable RLS on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Create Basic Policies

For each table, create 4 policies:
1. SELECT - Users can view their own data
2. INSERT - Users can insert their own data
3. UPDATE - Users can update their own data
4. DELETE - Users can delete their own data

## 🧪 Testing Checklist

- [ ] All 21 tables created
- [ ] All indexes created
- [ ] RLS enabled on all tables
- [ ] RLS policies configured
- [ ] Can insert test data
- [ ] Can read test data
- [ ] Can update test data
- [ ] Can delete test data
- [ ] Service functions working
- [ ] TypeScript types correct

## 🐛 Troubleshooting

### Issue: "Relation does not exist"
**Solution**: Ensure SQL script ran successfully. Check for errors in SQL Editor.

### Issue: "Permission denied"
**Solution**: Configure RLS policies. Check that policies are created correctly.

### Issue: "Foreign key violation"
**Solution**: Ensure parent records exist before inserting child records.

### Issue: "Duplicate key value"
**Solution**: Check for unique constraints. Email must be unique in users table.

### Issue: "Type mismatch"
**Solution**: Verify data types match table schema. Check TypeScript types.

## 📝 Common Queries

### Get all tasks for a user
```typescript
const tasks = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId);
```

### Get health records for a date range
```typescript
const records = await supabase
  .from('health_records')
  .select('*')
  .eq('user_id', userId)
  .gte('record_date', startDate)
  .lte('record_date', endDate);
```

### Get active medications
```typescript
const medications = await supabase
  .from('medications')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true);
```

### Get completed habits for today
```typescript
const today = new Date().toISOString().split('T')[0];
const logs = await supabase
  .from('habit_logs')
  .select('*')
  .eq('user_id', userId)
  .eq('log_date', today)
  .eq('completed', true);
```

## 🚀 Deployment Checklist

- [ ] All tables created in production
- [ ] RLS policies configured
- [ ] Service files updated
- [ ] TypeScript types updated
- [ ] Environment variables set
- [ ] Test data inserted
- [ ] All CRUD operations tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Ready for production

## 📚 Documentation Files

- **SUPABASE_TABLES_GUIDE.md** - Detailed table descriptions
- **TABLES_CREATED_SUMMARY.md** - Summary of all tables
- **supabase_tables_setup.sql** - SQL script
- **src/lib/types/database.ts** - TypeScript types

## 🎯 Next Steps

1. ✅ Run SQL script
2. ✅ Verify tables
3. ✅ Configure RLS
4. ✅ Update services
5. ✅ Test setup
6. ✅ Deploy to production

## 💡 Tips

1. **Backup**: Always backup your database before major changes
2. **Test**: Test in development before production
3. **Monitor**: Monitor database performance
4. **Scale**: Add more indexes if queries are slow
5. **Security**: Keep RLS policies updated

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://supabase.com/docs/reference/sql
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**Status**: Ready to Deploy
**Last Updated**: 2024
**Support**: Check documentation files for detailed information

