# 🔍 DEBUG USER REGISTRATION - Complete Guide

## 🎯 Debugging Checklist

Use this guide to debug any issues with user registration.

---

## 1️⃣ Check Browser Console (F12)

### Open DevTools
1. **Press**: `F12` (or right-click → Inspect)
2. **Go to**: **Console** tab
3. **Look for**: Error messages

### Expected Messages (Success)
```
✅ User profile and settings created successfully: [user-id]
```

### Common Error Messages

#### Error 1: 401 Unauthorized
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Profile creation error: Object
```

**Cause**: Service Role Key not set or incorrect
**Fix**: 
- Check .env.local has SUPABASE_SERVICE_ROLE_KEY
- Restart app: Ctrl + C, then npm run dev

#### Error 2: Missing Required Fields
```
error: 'Missing required fields: userId, email'
```

**Cause**: API not receiving userId or email
**Fix**: Check SignUpForm is sending correct data

#### Error 3: Database Connection Error
```
error: 'Failed to create user profile'
details: { ... }
```

**Cause**: Database connection issue
**Fix**: Check Supabase URL and keys are correct

---

## 2️⃣ Check Server Logs

### Look at Terminal

Where you ran `npm run dev`, look for:

#### Expected (Success)
```
User profile and settings created successfully: [user-id]
```

#### Common Errors

**Error 1**: Service Role Key not found
```
Error in create-profile API: Error: SUPABASE_SERVICE_ROLE_KEY is not set
```

**Fix**: Add SUPABASE_SERVICE_ROLE_KEY to .env.local

**Error 2**: Invalid JSON
```
Error in create-profile API: SyntaxError: Unexpected token
```

**Fix**: Check SignUpForm is sending valid JSON

**Error 3**: Database error
```
Error in create-profile API: Error: relation "users" does not exist
```

**Fix**: Check tables exist in Supabase

---

## 3️⃣ Check Supabase Logs

### Open Supabase Logs

1. **Go to**: https://app.supabase.com
2. **Select**: Your project
3. **Click**: **Logs** in left sidebar
4. **Look for**: Recent errors

### Common Errors

**Error 1**: RLS Policy Violation
```
new row violates row-level security policy
```

**Cause**: RLS policies not set correctly
**Fix**: Run supabase_rls_policies.sql script

**Error 2**: Column Not Found
```
column "notifications" does not exist
```

**Cause**: Wrong column name in insert
**Fix**: Check column names match database schema

**Error 3**: Unique Constraint Violation
```
duplicate key value violates unique constraint
```

**Cause**: Email already exists
**Fix**: Use different email for testing

---

## 4️⃣ Check Network Requests

### Open Network Tab

1. **Press**: `F12`
2. **Go to**: **Network** tab
3. **Fill form** and submit
4. **Look for**: Request to `/api/auth/create-profile`

### Check Request

1. **Click**: `/api/auth/create-profile` request
2. **Go to**: **Request** tab
3. **Check**: Body contains:
   ```json
   {
     "userId": "...",
     "email": "...",
     "name": "...",
     "phone": "..."
   }
   ```

### Check Response

1. **Go to**: **Response** tab
2. **Check**: Status code
   - ✅ 201 = Success
   - ❌ 400 = Bad request
   - ❌ 500 = Server error

3. **Check**: Response body
   - Success: `{ "success": true, "message": "..." }`
   - Error: `{ "error": "...", "details": "..." }`

---

## 5️⃣ Check Environment Variables

### Verify .env.local

```bash
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://tkcwrrcozpwrhdglzkvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Check All Three Keys Present

- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

---

## 6️⃣ Check Supabase Configuration

### Verify Tables Exist

1. **Go to**: https://app.supabase.com
2. **Select**: Your project
3. **Click**: **Table Editor**
4. **Check**: These tables exist:
   - [ ] users
   - [ ] settings

### Verify RLS Policies

1. **Go to**: **Authentication** → **Policies**
2. **Check**: Policies exist for:
   - [ ] users table
   - [ ] settings table

### Verify Columns

1. **Click**: **users** table
2. **Check**: These columns exist:
   - [ ] user_id
   - [ ] email
   - [ ] name
   - [ ] phone
   - [ ] password_hash
   - [ ] theme
   - [ ] language

---

## 7️⃣ Step-by-Step Debug Process

### Step 1: Check Environment
```bash
cat .env.local | grep SUPABASE
```

### Step 2: Restart App
```bash
# Stop: Ctrl + C
# Start:
npm run dev
```

### Step 3: Clear Browser Cache
- Ctrl + Shift + Delete
- Select "All time"
- Click "Clear data"

### Step 4: Test Signup
1. Go to http://localhost:3002/signup
2. Fill form
3. Submit

### Step 5: Check Browser Console
- Press F12
- Go to Console tab
- Look for errors

### Step 6: Check Server Logs
- Look at terminal
- Look for errors

### Step 7: Check Supabase
- Go to Table Editor
- Check users table
- Check settings table

### Step 8: Check Supabase Logs
- Go to Logs
- Look for errors

---

## 🎯 Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Symptoms**:
- Error: "401 Unauthorized"
- User not in database

**Causes**:
1. SUPABASE_SERVICE_ROLE_KEY not set
2. SUPABASE_SERVICE_ROLE_KEY is wrong
3. App not restarted after adding key

**Solutions**:
1. Check .env.local has the key
2. Get new key from Supabase
3. Restart app: Ctrl + C, npm run dev

### Issue 2: User Not in Database

**Symptoms**:
- No error in console
- User not in users table
- User not in settings table

**Causes**:
1. API route not called
2. API route failed silently
3. RLS policies blocking insert

**Solutions**:
1. Check Network tab for API call
2. Check server logs for errors
3. Check Supabase logs for RLS errors

### Issue 3: Email Not Received

**Symptoms**:
- No confirmation email
- Email in spam folder

**Causes**:
1. Email not configured in Supabase
2. Email service down
3. Email address invalid

**Solutions**:
1. Check Supabase email settings
2. Check Supabase logs
3. Use valid email address

### Issue 4: Duplicate Email Error

**Symptoms**:
- Error: "duplicate key value"
- User already exists

**Causes**:
- Email already registered

**Solutions**:
- Use different email
- Delete user from database
- Check if user already exists

---

## 📞 Getting Help

### Collect Information

1. **Browser console error** (F12 → Console)
2. **Server logs error** (terminal)
3. **Supabase logs error** (Logs tab)
4. **Network request/response** (F12 → Network)
5. **Environment variables** (cat .env.local)

### Share Information

When asking for help, provide:
1. Error message (exact text)
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots if possible

---

## ✅ Verification Checklist

- [ ] SUPABASE_SERVICE_ROLE_KEY in .env.local
- [ ] App restarted after adding key
- [ ] Browser cache cleared
- [ ] No 401 errors in console
- [ ] User appears in users table
- [ ] Settings appear in settings table
- [ ] All fields populated correctly
- [ ] Confirmation email received

---

**Status**: Ready to debug
**Time**: ~10 minutes
**Difficulty**: Medium

