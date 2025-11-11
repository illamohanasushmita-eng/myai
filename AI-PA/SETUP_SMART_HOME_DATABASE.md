# 🗄️ Smart Home Database Setup Guide

## ⚠️ Important: Database Tables Must Be Created First!

The error you're seeing (`Error fetching routines: {}`) means the `smart_home_routines` table doesn't exist in your Supabase database yet.

---

## 🚀 Step-by-Step Setup

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button

### Step 3: Copy the SQL Script

Copy the entire contents of the file: **`SMART_HOME_ROUTINES_SETUP.sql`**

The script creates 3 tables:
- `smart_home_routines` - Stores routine definitions
- `routine_actions` - Stores device actions for routines
- `routine_execution_logs` - Stores execution history

### Step 4: Paste and Execute

1. Paste the SQL code into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for the query to complete
4. You should see: **"Query executed successfully"**

### Step 5: Verify Tables Were Created

1. Go to **"Table Editor"** in the left sidebar
2. You should see these new tables:
   - ✅ `smart_home_routines`
   - ✅ `routine_actions`
   - ✅ `routine_execution_logs`
   - ✅ `smart_devices` (should already exist)

---

## 📋 What Each Table Does

### smart_home_routines
Stores the routine definitions (name, description, icon, color)

**Columns:**
- `routine_id` - Unique identifier
- `user_id` - Which user owns this routine
- `routine_name` - Name of the routine
- `description` - Optional description
- `icon` - Material icon name
- `color` - Color identifier
- `is_active` - Whether routine is active
- `created_at` - When created
- `updated_at` - When last updated

### routine_actions
Stores the device actions that belong to each routine

**Columns:**
- `action_id` - Unique identifier
- `routine_id` - Which routine this action belongs to
- `device_id` - Which device to control
- `user_id` - Which user owns this action
- `action_type` - Type of action (turn_on, turn_off, set_brightness, set_temperature)
- `action_value` - Optional value (brightness level, temperature)
- `order_index` - Order to execute actions
- `created_at` - When created

### routine_execution_logs
Tracks when routines are executed

**Columns:**
- `log_id` - Unique identifier
- `routine_id` - Which routine was executed
- `user_id` - Which user executed it
- `executed_at` - When it was executed
- `status` - Success/failed/partial
- `notes` - Optional notes

---

## 🔐 Security Features

All tables have:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Policies** that ensure users can only access their own data
- ✅ **Indexes** on frequently queried columns for performance
- ✅ **Foreign keys** to maintain data integrity

---

## ✅ Verification Checklist

After running the SQL script, verify:

- [ ] All 3 tables appear in Table Editor
- [ ] Each table has the correct columns
- [ ] RLS is enabled on each table
- [ ] Indexes are created
- [ ] No error messages in Supabase

---

## 🧪 Test the Setup

### Test 1: Check Table Exists

In SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('smart_home_routines', 'routine_actions', 'routine_execution_logs');
```

You should see 3 rows returned.

### Test 2: Check RLS Policies

In SQL Editor, run:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('smart_home_routines', 'routine_actions', 'routine_execution_logs');
```

You should see multiple policies listed.

### Test 3: Check Indexes

In SQL Editor, run:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('smart_home_routines', 'routine_actions', 'routine_execution_logs');
```

You should see several indexes listed.

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
- **Cause**: Tables haven't been created yet
- **Solution**: Run the SQL setup script

### Error: "permission denied"
- **Cause**: RLS policies are blocking access
- **Solution**: Make sure you're signed in with correct user ID

### Error: "duplicate key value"
- **Cause**: Trying to create duplicate data
- **Solution**: Check if data already exists

### Tables don't appear in Table Editor
- **Cause**: Page not refreshed
- **Solution**: Refresh the Supabase dashboard (F5)

---

## 📝 Next Steps

After creating the tables:

1. ✅ Go to `/at-home` page
2. ✅ Click "Add Device" to create a device
3. ✅ Click "Create New Routine" to create a routine
4. ✅ Check Supabase Table Editor to verify data was saved

---

## 🎯 Expected Behavior After Setup

### Adding a Device
1. Click "Add Device" card
2. Fill in device details
3. Click "Add Device"
4. Device appears in Supabase `smart_devices` table
5. ✅ No errors in console

### Creating a Routine
1. Click "Create New Routine"
2. Fill in routine details
3. Add devices and actions
4. Click "Create Routine"
5. Routine appears in Supabase `smart_home_routines` table
6. Actions appear in Supabase `routine_actions` table
7. ✅ No errors in console

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check Supabase logs** for database errors
3. **Verify tables exist** in Table Editor
4. **Check RLS policies** are correct
5. **Verify user ID** is stored in localStorage

---

## ✨ Summary

| Step | Status | Action |
|------|--------|--------|
| 1. Open Supabase | ⏳ | Go to supabase.com |
| 2. Open SQL Editor | ⏳ | Click SQL Editor |
| 3. Copy SQL Script | ⏳ | Copy SMART_HOME_ROUTINES_SETUP.sql |
| 4. Paste & Run | ⏳ | Paste and click Run |
| 5. Verify Tables | ⏳ | Check Table Editor |
| 6. Test Features | ⏳ | Try Add Device & Create Routine |

---

**Once tables are created, all errors will be fixed!** ✅

