# 🎉 Festival & Events Notification System - Setup Guide

## ✅ System Overview

The festival system automatically fetches festivals from the **Calendarific API** and displays them on your Tasks calendar with AI-powered notifications.

### Features:
- ✅ **Automatic API Fetching** - Fetches festivals from Calendarific API
- ✅ **Database Storage** - Stores festivals in Supabase
- ✅ **Calendar Display** - Shows festivals on Tasks page calendar
- ✅ **AI Notifications** - Sends notifications 1 day before each festival
- ✅ **Multi-Category Support** - National, Religious, Observance, Cultural festivals
- ✅ **Regional Support** - Includes Telugu region and pan-India festivals

---

## 🚀 Quick Start (3 Steps)

### Step 1: Ensure Database Schema is Deployed ✅

You've already deployed the festival schema! Verify it's working:

```bash
node test-festival-db.js
```

You should see:
```
✅ festival_events table exists!
✅ ai_notifications table exists!
✅ user_festival_preferences table exists!
✅ festival_sync_log table exists!
```

---

### Step 2: Sync Festivals from Calendarific API

Run the sync script to fetch festivals:

```bash
node sync-festivals-now.js
```

This will:
- Fetch all Indian festivals for 2025 and 2026
- Store them in the database
- Include national holidays, religious festivals, observances, and cultural events

**Expected Output:**
```
✅ 2025 Sync Successful!
   Festivals synced: 50+
   Total API holidays: 50+

✅ 2026 Sync Successful!
   Festivals synced: 50+
   Total API holidays: 50+

📊 Total festivals synced: 100+
```

---

### Step 3: View Festivals on Calendar

1. Open your browser: `http://localhost:3002/tasks`
2. Click **Calendar** view
3. Toggle **"Show Festivals"** ON
4. You should see festivals displayed with orange indicators! 🎊

---

## 📅 Festival Categories

The system automatically categorizes festivals:

| Icon | Category | Examples |
|------|----------|----------|
| 🇮🇳 | National | Republic Day, Independence Day, Gandhi Jayanti |
| 🙏 | Religious | Diwali, Holi, Eid, Christmas, Guru Nanak Jayanti |
| 📅 | Observance | World Environment Day, International Women's Day |
| 🎨 | Cultural | Regional festivals, cultural celebrations |

---

## 🔔 AI Notifications

### How It Works:

1. **Daily Check** - System checks for festivals happening tomorrow
2. **Generate Notifications** - Creates personalized AI notifications
3. **User Receives** - Users see notifications when they open the app

### Notification Templates:

**National Holidays:**
> "Tomorrow is Republic Day! 🇮🇳 This national holiday celebrates an important moment in our nation's history. Would you like me to set a reminder or help you plan something special?"

**Religious Festivals:**
> "Tomorrow is Diwali! 🙏 This sacred festival is a time for celebration and reflection. Shall I remind you to prepare for the festivities or send wishes to your loved ones?"

**Cultural Events:**
> "Tomorrow is Holi! 🎨 This cultural celebration is a wonderful time to connect with traditions. Shall I help you plan activities or send greetings to friends and family?"

### Generate Notifications Manually:

```bash
# Test notification generation
curl http://localhost:3002/api/festivals/notifications/generate
```

Or visit in browser:
```
http://localhost:3002/api/festivals/notifications/generate
```

---

## 🔄 Automatic Syncing

### Option 1: Manual Sync (Current)

Run the sync script whenever you want to update festivals:

```bash
node sync-festivals-now.js
```

### Option 2: Scheduled Sync (Recommended)

Set up a cron job or scheduled task to run weekly/monthly:

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Weekly (every Sunday)
4. Action: Start a program
5. Program: `node`
6. Arguments: `C:\Users\shiva\MYAI\AI-PA\sync-festivals-now.js`

**Linux/Mac (Crontab):**
```bash
# Run every Sunday at 2 AM
0 2 * * 0 cd /path/to/AI-PA && node sync-festivals-now.js
```

### Option 3: API Endpoint

You can also trigger sync via API:

```bash
# Sync current year
curl -X POST http://localhost:3002/api/festivals/sync \
  -H "Content-Type: application/json" \
  -d '{"country":"IN"}'

# Sync specific year
curl -X POST http://localhost:3002/api/festivals/sync \
  -H "Content-Type: application/json" \
  -d '{"country":"IN","year":2026}'
```

Or use GET for quick testing:
```
http://localhost:3002/api/festivals/sync?country=IN&year=2025
```

---

## 🧪 Testing

### Test 1: Verify Database Tables
```bash
node test-festival-db.js
```

### Test 2: Sync Festivals
```bash
node sync-festivals-now.js
```

### Test 3: Check Calendar
1. Go to `http://localhost:3002/tasks`
2. Click Calendar view
3. Toggle "Show Festivals" ON
4. Click on dates with festivals (look for orange dots)

### Test 4: Generate Notifications
```bash
curl http://localhost:3002/api/festivals/notifications/generate
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/festivals/sync` | POST/GET | Sync festivals from Calendarific API |
| `/api/festivals/list` | GET | Get festivals with filters |
| `/api/festivals/notifications/generate` | POST/GET | Generate notifications for tomorrow's festivals |
| `/api/festivals/notifications` | GET | Get user notifications |
| `/api/festivals/toggle-reminder` | PUT | Toggle festival reminder on/off |

---

## 🎯 What's Included

### Festivals Fetched:
- ✅ All Indian national holidays
- ✅ Major religious festivals (Hindu, Muslim, Christian, Sikh, etc.)
- ✅ Regional festivals (including Telugu region)
- ✅ Cultural observances
- ✅ International observances celebrated in India

### Data Stored:
- Festival name
- Description
- Date
- Category (national/religious/observance/cultural)
- Type (from Calendarific)
- Locations/States (if regional)
- Active status
- Reminder enabled status

---

## 🔧 Troubleshooting

### Issue: No festivals showing on calendar

**Solution:**
1. Check if sync was successful: `node sync-festivals-now.js`
2. Verify database has data: `node test-festival-db.js`
3. Make sure "Show Festivals" toggle is ON
4. Check browser console for errors (F12)

### Issue: Sync fails with API error

**Solution:**
1. Check internet connection
2. Verify Calendarific API key is correct in `.env.local`
3. Check API rate limits (Calendarific free tier: 1000 requests/month)

### Issue: Notifications not generating

**Solution:**
1. Make sure festivals exist in database
2. Check if users table has data
3. Run notification generation manually: `curl http://localhost:3002/api/festivals/notifications/generate`

---

## 📈 Next Steps

1. ✅ **Sync festivals** - Run `node sync-festivals-now.js`
2. ✅ **View on calendar** - Check Tasks page
3. ✅ **Test notifications** - Generate test notifications
4. ⏰ **Set up auto-sync** - Schedule weekly sync
5. 🎨 **Customize** - Add custom festivals via UI (future feature)

---

## 🎊 Success!

Once you've completed the setup:
- ✅ Festivals automatically sync from Calendarific API
- ✅ Calendar displays festivals with visual indicators
- ✅ Users receive AI notifications 1 day before festivals
- ✅ System updates weekly/monthly automatically

**Enjoy your automated festival notification system!** 🎉

