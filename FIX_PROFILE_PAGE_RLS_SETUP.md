# 🔐 Fix Profile Page - Enable RLS Policies

## Problem
The profile page is showing a 406 error because the RLS (Row Level Security) policies are not properly configured on the `users` table in Supabase.

## Solution
You need to enable RLS on the users table and create the necessary policies.

---

## ✅ Step-by-Step Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Enable RLS on Users Table
Copy and paste this SQL command:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

Click **Run** and wait for success ✅

### Step 3: Create RLS Policies for Users Table
Copy and paste this SQL command:

```sql
-- Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role can manage users"
ON users FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
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
```

Click **Run** and wait for success ✅

### Step 4: Verify RLS is Enabled
1. Go to **Authentication** → **Policies** in Supabase
2. Select the **users** table
3. You should see 4 policies:
   - ✅ Service role can manage users
   - ✅ Users can insert their own profile
   - ✅ Users can view their own profile
   - ✅ Users can update their own profile

---

## 🧪 Test the Fix

1. **Refresh the browser** at http://localhost:3003/settings/profile
2. **Expected behavior**:
   - No more 406 errors
   - Profile loads successfully
   - If profile doesn't exist, it's created automatically
   - Console shows clean logs with `[USER-SERVICE]` prefix

### Console Output (Expected)
```
[USER-SERVICE] Fetching user with ID: 020cf70e-5fc8-431a-94ff-bd8b1eec400c
[USER-SERVICE] User profile not found (PGRST116)
Creating default profile for user: 020cf70e-5fc8-431a-94ff-bd8b1eec400c
[USER-SERVICE] Creating user with email: user@example.com
[USER-SERVICE] User created successfully
Default profile created successfully: { user_id: '...', email: '...', ... }
```

---

## 🔍 Troubleshooting

### If you still see 406 errors:

1. **Check RLS is enabled**:
   - Go to **Authentication** → **Policies**
   - Select **users** table
   - Verify RLS is toggled ON (blue switch)

2. **Check policies exist**:
   - You should see 4 policies listed
   - If not, run the SQL commands again

3. **Check user_id format**:
   - Make sure `user_id` in the users table matches the UUID format from Supabase Auth
   - Both should be UUIDs

4. **Clear browser cache**:
   - Press Ctrl+Shift+Delete
   - Clear all cache
   - Refresh the page

### If profile still doesn't load:

1. **Check Supabase connection**:
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

2. **Check user exists in auth.users**:
   - Go to **Authentication** → **Users** in Supabase
   - Verify your user is listed

3. **Check users table**:
   - Go to **SQL Editor**
   - Run: `SELECT * FROM users WHERE user_id = '020cf70e-5fc8-431a-94ff-bd8b1eec400c';`
   - If no rows, the profile will be created automatically

---

## 📋 Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
- [ ] Created all 4 RLS policies
- [ ] Verified policies in Authentication → Policies
- [ ] Refreshed browser at /settings/profile
- [ ] Profile loads without 406 errors
- [ ] Console shows clean logs

---

## ✨ What This Fixes

✅ **406 Not Acceptable Error** - Resolved by enabling RLS policies  
✅ **Profile Not Loading** - Now loads or creates automatically  
✅ **Permission Denied Errors** - RLS policies allow authenticated users to access their data  
✅ **Auto-Profile Creation** - New users get a default profile automatically  

---

## 🎉 Done!

Your profile page should now work perfectly. Users can:
- View their profile
- Update their profile
- Auto-create profile if it doesn't exist
- See clean error logs for debugging

