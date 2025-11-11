# 🔧 **Debugging User Registration Issues**

## 📋 **Comprehensive Debugging Checklist**

### **1. Check Environment Variables**

#### In `.env.local`:
```bash
# Should have these 3 variables:
NEXT_PUBLIC_SUPABASE_URL=https://tkcwrrcozpwrhdglzkvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Check**:
- ✓ No duplicate keys
- ✓ Keys are not empty
- ✓ Keys don't have extra spaces
- ✓ Service Role Key is different from Anon Key

---

### **2. Check Browser Console Logs**

#### Open DevTools:
```
Press: F12
Go to: Console tab
```

#### Look for these logs (in order):

**✅ Success Logs:**
```
[SIGNUP] Creating user profile via API route for userId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[SIGNUP] User profile and settings created successfully: {
  userId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  profileId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  settingsId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**❌ Error Logs:**
```
[SIGNUP] Profile creation failed: {
  status: 500,
  error: "Failed to create user profile",
  details: "..."
}
```

---

### **3. Check Server Terminal Logs**

#### Look for these logs (in order):

**✅ Success Logs:**
```
[CREATE-PROFILE] Starting profile creation...
[CREATE-PROFILE] Request body: { userId: 'xxxxxxxx...', email: 'john@example.com', name: 'John Doe', phone: null }
[CREATE-PROFILE] Creating user profile for userId: xxxxxxxx...
[CREATE-PROFILE] User profile created successfully: xxxxxxxx...
[CREATE-PROFILE] Creating default settings for userId: xxxxxxxx...
[CREATE-PROFILE] Settings created successfully: xxxxxxxx...
[CREATE-PROFILE] User profile and settings created successfully for userId: xxxxxxxx...
```

**❌ Error Logs:**
```
[CREATE-PROFILE] Profile creation failed: {
  code: "23505",
  message: "duplicate key value violates unique constraint \"users_email_key\"",
  details: "..."
}
```

---

### **4. Check Supabase Dashboard**

#### Verify Tables:
1. Go to https://app.supabase.com
2. Select your project
3. Click **Table Editor**

#### Check `users` table:
- ✓ New user appears
- ✓ `user_id` is populated
- ✓ `email` is correct
- ✓ `name` is correct
- ✓ `phone` is correct (or null)
- ✓ `theme` is 'light'
- ✓ `language` is 'en'
- ✓ `created_at` is recent

#### Check `settings` table:
- ✓ New settings appear
- ✓ `user_id` matches user
- ✓ `notifications_enabled` is true
- ✓ `email_notifications` is true
- ✓ `push_notifications` is false
- ✓ `voice_input_enabled` is true
- ✓ `data_sharing` is false
- ✓ `theme` is 'light'
- ✓ `language` is 'en'

---

### **5. Check RLS Policies**

#### In Supabase Dashboard:
1. Click **SQL Editor**
2. Click **New Query**
3. Run this query:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

#### Should see these policies:
- ✓ "Service role can manage users"
- ✓ "Users can insert their own profile"
- ✓ "Users can view their own profile"
- ✓ "Users can update their own profile"

#### If missing:
1. Run the updated `supabase_rls_policies.sql` script
2. Make sure to include the service role bypass policies

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: "Failed to create user profile" (500 Error)**

#### Possible Causes:
1. Service Role Key is invalid
2. RLS policies don't allow service role bypass
3. Database schema is incorrect

#### Debug Steps:
```
1. Check .env.local for malformed Service Role Key
2. Check server logs for [CREATE-PROFILE] error details
3. Run updated RLS policies in Supabase SQL Editor
4. Restart app: npm run dev
5. Try signup again
```

---

### **Issue 2: "Missing SUPABASE_SERVICE_ROLE_KEY"**

#### Possible Causes:
1. Environment variable not set
2. App not restarted after editing .env.local
3. .env.local file has syntax error

#### Debug Steps:
```
1. Check .env.local has SUPABASE_SERVICE_ROLE_KEY
2. Check key is not empty
3. Stop app: Ctrl + C
4. Restart app: npm run dev
5. Try signup again
```

---

### **Issue 3: User Created but No Profile in Database**

#### Possible Causes:
1. API route not being called
2. API route returning error silently
3. RLS policies blocking insert

#### Debug Steps:
```
1. Open browser console (F12)
2. Look for [SIGNUP] logs
3. Check if "Creating user profile via API route" appears
4. If not, check for JavaScript errors
5. Check server logs for [CREATE-PROFILE] errors
6. Run updated RLS policies
7. Restart app and try again
```

---

### **Issue 4: "Duplicate Key" Error**

#### Possible Causes:
1. User already exists in database
2. Email already used

#### Debug Steps:
```
1. Check Supabase users table
2. Look for existing user with same email
3. Delete duplicate if needed
4. Try signup with different email
```

---

### **Issue 5: RLS Policy Errors**

#### Possible Causes:
1. Policies not updated
2. Policies have syntax errors
3. Service role bypass missing

#### Debug Steps:
```
1. Go to Supabase SQL Editor
2. Run: SELECT * FROM pg_policies WHERE tablename = 'users';
3. Check if "Service role can manage users" exists
4. If not, run updated RLS policies script
5. Check for SQL errors in output
```

---

## 📊 **Log Analysis Guide**

### **Successful Registration Flow:**
```
Browser Console:
  [SIGNUP] Creating user profile via API route for userId: abc123...
  [SIGNUP] User profile and settings created successfully: {...}

Server Terminal:
  [CREATE-PROFILE] Starting profile creation...
  [CREATE-PROFILE] Request body: {...}
  [CREATE-PROFILE] Creating user profile for userId: abc123...
  [CREATE-PROFILE] User profile created successfully: abc123...
  [CREATE-PROFILE] Creating default settings for userId: abc123...
  [CREATE-PROFILE] Settings created successfully: xyz789...
  [CREATE-PROFILE] User profile and settings created successfully for userId: abc123...

Supabase Dashboard:
  users table: New row with user_id = abc123...
  settings table: New row with user_id = abc123...
```

### **Failed Registration Flow:**
```
Browser Console:
  [SIGNUP] Creating user profile via API route for userId: abc123...
  [SIGNUP] Profile creation failed: {
    status: 500,
    error: "Failed to create user profile",
    details: "..."
  }

Server Terminal:
  [CREATE-PROFILE] Starting profile creation...
  [CREATE-PROFILE] Request body: {...}
  [CREATE-PROFILE] Creating user profile for userId: abc123...
  [CREATE-PROFILE] Profile creation failed: {
    code: "42501",
    message: "new row violates row-level security policy",
    details: "..."
  }

Supabase Dashboard:
  users table: No new row
  settings table: No new row
```

---

## 🛠️ **Manual Testing Steps**

### **Step 1: Clear Browser Cache**
```
Press: Ctrl + Shift + Delete
Select: All time
Check: Cookies and cached images
Click: Clear data
```

### **Step 2: Restart Application**
```
Terminal:
  Ctrl + C (stop current app)
  npm run dev (restart)
```

### **Step 3: Test Signup**
```
1. Go to http://localhost:3002/signup
2. Fill form with test data
3. Click Sign Up
4. Watch browser console (F12)
5. Watch server terminal
6. Check Supabase dashboard
```

### **Step 4: Verify Data**
```
1. Go to https://app.supabase.com
2. Select project
3. Click Table Editor
4. Check users table for new row
5. Check settings table for new row
6. Verify all fields are correct
```

---

## 📞 **Getting Help**

### **Collect Information:**
1. Screenshot of browser console errors
2. Screenshot of server terminal errors
3. Screenshot of Supabase dashboard (users table)
4. Screenshot of Supabase dashboard (settings table)
5. Contents of `.env.local` (hide keys)
6. Output of RLS policies query

### **Check These Files:**
- `src/app/api/auth/create-profile/route.ts` - API route
- `src/lib/services/authService.ts` - Auth service
- `src/components/SignUpForm.tsx` - Signup form
- `supabase_rls_policies.sql` - RLS policies
- `.env.local` - Environment variables

---

**Status**: ✅ Comprehensive debugging guide
**Use When**: Registration not working
**Time to Debug**: ~10-15 minutes

