# 🔑 Get Supabase Service Role Key

## ⚠️ Why You Need This

The 401 Unauthorized error happens because:
- ✅ User is created in Supabase Auth
- ❌ But user is NOT yet confirmed (email not verified)
- ❌ RLS policies block unconfirmed users from inserting data
- ✅ Solution: Use Service Role Key on backend to bypass RLS

---

## 📋 Steps to Get Service Role Key

### Step 1: Open Supabase Dashboard
- Go to: https://app.supabase.com
- Select your project: `tkcwrrcozpwrhdglzkvq`

### Step 2: Go to Project Settings
- Click **Settings** in left sidebar
- Click **API** in the submenu

### Step 3: Find Service Role Key
- Look for section: **Project API keys**
- You should see two keys:
  - **anon public** (already in your .env.local)
  - **service_role secret** (this is what you need)

### Step 4: Copy Service Role Key
- Click the **service_role secret** key
- Click the copy icon
- The key will be copied to clipboard

### Step 5: Add to .env.local
1. Open file: `.env.local` in your project
2. Add this line at the end:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<paste_the_key_here>
   ```
3. Replace `<paste_the_key_here>` with the actual key you copied
4. Save the file

### Step 6: Restart Your Application
1. Stop the running application (Ctrl + C in terminal)
2. Run: `npm run dev`
3. Wait for it to start

### Step 7: Test Signup
1. Go to http://localhost:3002/signup
2. Fill form and submit
3. Check Supabase users table
4. User data should now be stored ✅

---

## 📝 Example .env.local

After adding the service role key, your `.env.local` should look like:

```
NEXT_PUBLIC_SUPABASE_URL=https://tkcwrrcozpwrhdglzkvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3dycmNvenB3cmhkZ2x6a3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNDA3ODMsImV4cCI6MjA3NTYxNjc4M30.0VDX5mX2slX3nksRZ6V59oj2XAS3oyetQw7fVt0u3SU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3dycmNvenB3cmhkZ2x6a3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MDc4MywiZXhwIjoyMDc1NjE2NzgzfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## ⚠️ Security Warning

**IMPORTANT**: The service role key is sensitive!
- ✅ Keep it in `.env.local` (local only, not in git)
- ✅ Never commit it to version control
- ✅ Never share it publicly
- ✅ It's only used on the backend (server-side)
- ❌ Never expose it to the client/browser

---

## 🔍 Verify It's Working

After adding the service role key:

1. **Check browser console (F12)**
   - Should NOT see "401 Unauthorized" error
   - Should see "User profile and settings created successfully"

2. **Check Supabase users table**
   - Go to Table Editor
   - Select users table
   - You should see your test user ✅

3. **Check Supabase settings table**
   - Select settings table
   - You should see settings row ✅

---

## 🚨 If It Still Doesn't Work

### Check 1: Is the key in .env.local?
```bash
cat .env.local
```
Should show:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Check 2: Did you restart the app?
- Stop: Ctrl + C
- Start: npm run dev
- Wait for "Ready in X seconds"

### Check 3: Check browser console
- Press F12
- Go to Console tab
- Look for error messages
- Copy the error

### Check 4: Check server logs
- Look at terminal where `npm run dev` is running
- Look for error messages
- Copy the error

---

## 📊 How It Works Now

### Before (401 Error):
```
User Signs Up
    ↓
Auth User Created ✅
    ↓
Try to Insert Profile (from client)
    ↓
❌ RLS Policy Blocks (user not confirmed)
    ↓
❌ 401 Unauthorized Error
    ↓
❌ User Data NOT Stored
```

### After (With Service Role Key):
```
User Signs Up
    ↓
Auth User Created ✅
    ↓
Call API Route (from client)
    ↓
API Route Uses Service Role Key (on server)
    ↓
✅ RLS Policy Bypassed (service role has permission)
    ↓
✅ User Profile Inserted
    ↓
✅ Settings Created
    ↓
✅ Success!
```

---

## 🎯 Summary

✅ **Problem**: 401 Unauthorized - user not confirmed
✅ **Solution**: Use Service Role Key on backend
✅ **Steps**: Get key → Add to .env.local → Restart app
✅ **Time**: 5 minutes
✅ **Result**: User data stored in Supabase ✅

---

## 🚀 Next Steps

1. **Get Service Role Key** from Supabase Dashboard
2. **Add to .env.local**
3. **Restart application**
4. **Test signup**
5. **Verify data in Supabase**

---

**Status**: Ready to implement
**Priority**: HIGH
**Time to Fix**: ~5 minutes

