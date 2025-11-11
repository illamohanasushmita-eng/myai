# 🔧 Fix: 401 Unauthorized Error - User Data Not Storing

## ✅ Problem Identified

You're getting **401 Unauthorized** error because:

1. ✅ User is created in Supabase Auth
2. ❌ User is NOT yet confirmed (email not verified)
3. ❌ RLS policies block unconfirmed users from inserting data
4. ❌ Client-side insert fails with 401 error
5. ❌ User data is NOT stored

---

## ✅ Solution Implemented

I've created a backend API route that uses the **Service Role Key** to bypass RLS policies:

### What Changed:

1. **Created API Route**: `src/app/api/auth/create-profile/route.ts`
   - Uses Service Role Key (server-side only)
   - Bypasses RLS policies
   - Creates user profile and settings

2. **Updated Auth Service**: `src/lib/services/authService.ts`
   - Now calls the API route instead of direct insert
   - Handles profile creation on backend

---

## 🚀 What You Need to Do

### Step 1: Get Service Role Key from Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Go to Settings → API**
   - Click **Settings** in left sidebar
   - Click **API** in submenu

3. **Copy Service Role Key**
   - Find: **service_role secret** (NOT the anon key)
   - Click the copy icon
   - The key will be copied

### Step 2: Add Service Role Key to .env.local

1. **Open `.env.local`** in your project

2. **Add this line at the end**:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<paste_the_key_here>
   ```

3. **Replace** `<paste_the_key_here>` with the actual key

4. **Save the file**

### Step 3: Restart Your Application

1. **Stop the app**
   - Press `Ctrl + C` in the terminal

2. **Start the app**
   - Run: `npm run dev`
   - Wait for "Ready in X seconds"

### Step 4: Test Signup

1. **Clear browser cache**
   - Press `Ctrl + Shift + Delete`
   - Clear all data

2. **Go to signup page**
   - http://localhost:3002/signup

3. **Fill form and submit**
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
   - Confirm: TestPassword123
   - Accept Terms

4. **Check browser console (F12)**
   - Should see: "User profile and settings created successfully"
   - Should NOT see: "401 Unauthorized"

5. **Check Supabase**
   - Go to Table Editor
   - Select **users** table
   - You should see your test user ✅
   - Select **settings** table
   - You should see settings row ✅

---

## 📋 Verification Checklist

- [ ] Got Service Role Key from Supabase
- [ ] Added SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] Restarted application (npm run dev)
- [ ] Cleared browser cache
- [ ] Tested signup
- [ ] No 401 error in console
- [ ] User visible in users table
- [ ] Settings visible in settings table
- [ ] All fields populated correctly

---

## 🔍 How to Verify Service Role Key is Loaded

### Check 1: Look at .env.local
```bash
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://tkcwrrcozpwrhdglzkvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Check 2: Check Application Logs
- Look at terminal where `npm run dev` is running
- Should NOT show errors about missing SUPABASE_SERVICE_ROLE_KEY

### Check 3: Test Signup
- Go to signup page
- Submit form
- Check browser console (F12)
- Should see success message, not 401 error

---

## 📊 How It Works Now

### Before (401 Error):
```
User Signs Up
    ↓
Auth User Created ✅
    ↓
Try to Insert Profile (from client with anon key)
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

## 🔐 Security

✅ **Safe**: Service Role Key is only used on backend (server-side)
✅ **Safe**: Never exposed to client/browser
✅ **Safe**: Stored in .env.local (local only, not in git)
✅ **Safe**: Used only for creating user profiles during signup

---

## 🚨 If It Still Doesn't Work

### Issue: Still getting 401 error

**Check 1**: Is the key in .env.local?
```bash
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

**Check 2**: Did you restart the app?
- Stop: Ctrl + C
- Start: npm run dev
- Wait for "Ready in X seconds"

**Check 3**: Is the key correct?
- Go to Supabase Dashboard
- Settings → API
- Copy the **service_role secret** key again
- Make sure it's the full key (starts with eyJ...)

**Check 4**: Check browser console
- Press F12
- Go to Console tab
- Look for error messages
- Copy the error

**Check 5**: Check server logs
- Look at terminal where npm run dev is running
- Look for error messages
- Copy the error

---

## 📁 Files Changed

### Updated Files (1)
- ✅ `src/lib/services/authService.ts` - Now calls API route

### New Files (2)
- ✅ `src/app/api/auth/create-profile/route.ts` - Backend API route
- ✅ `GET_SERVICE_ROLE_KEY.md` - Guide to get service role key

---

## 🎯 Summary

✅ **Problem**: 401 Unauthorized - user not confirmed
✅ **Root Cause**: RLS policies block unconfirmed users
✅ **Solution**: Use Service Role Key on backend
✅ **Implementation**: API route created
✅ **What You Need**: Add SUPABASE_SERVICE_ROLE_KEY to .env.local
✅ **Time**: 5 minutes
✅ **Result**: User data stored in Supabase ✅

---

## 🚀 Next Steps

1. **Get Service Role Key** from Supabase Dashboard
2. **Add to .env.local**: `SUPABASE_SERVICE_ROLE_KEY=...`
3. **Restart application**: `npm run dev`
4. **Test signup**: Go to /signup and submit form
5. **Verify data**: Check users and settings tables in Supabase

---

**Status**: Ready to implement
**Priority**: HIGH
**Time to Fix**: ~5 minutes
**Difficulty**: Easy

