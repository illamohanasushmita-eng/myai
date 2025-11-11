# 🔐 Verify Reminder RLS Policies Setup

## Overview
This guide helps you verify that RLS (Row Level Security) policies are properly enabled on the `reminders` table in Supabase.

## ✅ Step 1: Check if RLS is Enabled

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Run this SQL to check RLS status:

```sql
-- Check if RLS is enabled on reminders table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'reminders';
```

**Expected Result:**
```
tablename  | rowsecurity
-----------|------------
reminders  | t
```

If `rowsecurity` is `f` (false), RLS is NOT enabled. Run this to enable it:

```sql
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
```

## ✅ Step 2: Check Existing Policies

Run this SQL to see all policies on the reminders table:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'reminders';
```

**Expected Policies:**
1. ✅ Service role can manage reminders
2. ✅ Users can insert their own reminders
3. ✅ Users can view their own reminders
4. ✅ Users can update their own reminders
5. ✅ Users can delete their own reminders

If any policies are missing, create them:

```sql
-- Service role bypass
CREATE POLICY "Service role can manage reminders"
ON reminders FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Users can insert their own reminders
CREATE POLICY "Users can insert their own reminders"
ON reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reminders
CREATE POLICY "Users can view their own reminders"
ON reminders FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own reminders
CREATE POLICY "Users can update their own reminders"
ON reminders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reminders
CREATE POLICY "Users can delete their own reminders"
ON reminders FOR DELETE
USING (auth.uid() = user_id);
```

## ✅ Step 3: Test Reminder Creation

1. Open http://localhost:3003/test-lara
2. Click **Start** button
3. Say "Hey Lara"
4. Wait for "How can I help you?"
5. Say "Remind me to call my mom tomorrow 5:30"
6. Check the console for logs:
   - ✅ `📌 [REMINDER-VOICE] Creating reminder...`
   - ✅ `📌 [REMINDER-VOICE] Reminder creation response:`
   - ✅ `Opening reminders page`

## ✅ Step 4: Verify Reminder in Database

1. Go to **SQL Editor** → **New Query**
2. Run this SQL:

```sql
-- Check if reminder was created
SELECT reminder_id, user_id, title, reminder_time, status, created_at
FROM reminders
WHERE user_id = '020cf70e-5fc8-431a-94ff-bd8b1eec400c'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- You should see the reminder you just created
- `title` should be "call my mom tomorrow 5:30."
- `status` should be "pending"
- `reminder_time` should be a valid ISO timestamp

## ✅ Step 5: Verify Reminder in UI

1. Navigate to http://localhost:3003/reminders
2. You should see the newly created reminder in the "Upcoming" section
3. The reminder should show:
   - Title: "call my mom tomorrow 5:30."
   - Time: "Tomorrow, 5:30 PM" (or similar)

## 🔍 Troubleshooting

### Reminder not appearing in database
- Check if RLS is enabled (Step 1)
- Check if policies exist (Step 2)
- Check server logs for errors
- Verify user_id matches between auth and database

### Reminder not appearing in UI
- Check browser console for errors
- Verify `/api/reminders?userId=...` returns the reminder
- Check if reminders page is fetching with correct userId
- Try refreshing the page

### 406 Error when creating reminder
- This means RLS policies are blocking the request
- Verify all 5 policies are created
- Check that `auth.uid()` matches the `user_id` in the database

## 📋 Checklist

- [ ] RLS is enabled on reminders table
- [ ] All 5 policies are created
- [ ] Service role policy exists
- [ ] User SELECT policy exists
- [ ] User INSERT policy exists
- [ ] User UPDATE policy exists
- [ ] User DELETE policy exists
- [ ] Reminder created via voice command
- [ ] Reminder appears in database
- [ ] Reminder appears in UI

## ✨ Success!

If all checks pass, your reminder creation flow is working correctly! 🎉

