# ⚡ Quick Action: Fix 401 Unauthorized Error

## 🎯 What to Do (3 Steps - 5 Minutes)

### Step 1: Get Service Role Key (2 minutes)

1. Go to: https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Find **service_role secret** (NOT anon key)
5. Click copy icon
6. Copy the key

### Step 2: Add to .env.local (1 minute)

1. Open `.env.local` in your project
2. Add this line at the end:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<paste_key_here>
   ```
3. Replace `<paste_key_here>` with the actual key
4. Save file

### Step 3: Restart App (2 minutes)

1. Stop app: Press `Ctrl + C`
2. Start app: `npm run dev`
3. Wait for "Ready in X seconds"

---

## ✅ Test It

1. Go to http://localhost:3002/signup
2. Fill form and submit
3. Check browser console (F12)
4. Should see: "User profile and settings created successfully"
5. Check Supabase users table
6. User should be there ✅

---

## 📋 Checklist

- [ ] Got service_role secret from Supabase
- [ ] Added SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] Restarted app
- [ ] Tested signup
- [ ] No 401 error
- [ ] User in database ✅

---

## 🚀 Done!

Your user registration now works! 🎉

---

See `FIX_401_UNAUTHORIZED_ERROR.md` for detailed guide.
