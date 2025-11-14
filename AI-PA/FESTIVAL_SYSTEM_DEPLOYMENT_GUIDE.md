# 🎉 Festival & Events Notification System - Deployment Guide

## 📋 Overview

This guide will help you deploy the complete festival and events notification system for the AI-PA application. The system automatically notifies users about upcoming festivals and events with voice prompts and AI-generated suggestions.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. ✅ Supabase project set up
2. ✅ Calendarific API key: `2VT5I4FRzaZfH3qxthwibn6rkxruEXZo` (already in `.env.local`)
3. ✅ OpenAI API key configured
4. ✅ Supabase CLI installed (for Edge Functions deployment)

---

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Database Schema

1. **Run the deployment helper script:**
   ```powershell
   .\deploy-festival-schema.ps1
   ```

2. **Or manually:**
   - Open `src/lib/db/festival-schema.sql`
   - Copy the entire SQL content
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run the SQL

3. **Verify tables created:**
   - `festival_events`
   - `ai_notifications`
   - `user_festival_preferences`
   - `festival_sync_log`

---

### Step 2: Deploy Supabase Edge Functions

#### 2.1 Install Supabase CLI (if not already installed)

```powershell
# Using npm
npm install -g supabase

# Or using scoop
scoop install supabase
```

#### 2.2 Login to Supabase

```bash
supabase login
```

#### 2.3 Link your project

```bash
cd AI-PA
supabase link --project-ref YOUR_PROJECT_REF
```

#### 2.4 Set Edge Function secrets

```bash
# Set Calendarific API key
supabase secrets set CALENDARIFIC_API_KEY=2VT5I4FRzaZfH3qxthwibn6rkxruEXZo

# Set OpenAI API key (if not already set)
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

#### 2.5 Deploy Edge Functions

```bash
# Deploy festival-events function
supabase functions deploy festival-events

# Deploy festival-reminder function
supabase functions deploy festival-reminder
```

---

### Step 3: Set Up Cron Jobs

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create two cron jobs:

#### Cron Job 1: Weekly Festival Sync

```sql
-- Run every Sunday at 2:00 AM
SELECT cron.schedule(
  'weekly-festival-sync',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/festival-events',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{"country": "IN", "year": ' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '}'::jsonb
    ) as request_id;
  $$
);
```

#### Cron Job 2: Daily Festival Reminders

```sql
-- Run every day at 9:00 AM
SELECT cron.schedule(
  'daily-festival-reminders',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/festival-reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key

---

### Step 4: Initial Festival Data Sync

Run a manual sync to populate initial festival data:

1. **Using the API route:**
   ```bash
   curl -X POST http://localhost:3002/api/festivals/sync \
     -H "Content-Type: application/json" \
     -d '{"country": "IN", "year": 2025}'
   ```

2. **Or directly call the Edge Function:**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/festival-events \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"country": "IN", "year": 2025}'
   ```

---

### Step 5: Verify Deployment

1. **Check database tables:**
   ```sql
   -- Check if festivals were synced
   SELECT COUNT(*) FROM festival_events;

   -- View upcoming festivals
   SELECT name, event_date, category 
   FROM festival_events 
   WHERE event_date >= CURRENT_DATE 
   ORDER BY event_date 
   LIMIT 10;
   ```

2. **Check sync logs:**
   ```sql
   SELECT * FROM festival_sync_log ORDER BY created_at DESC LIMIT 5;
   ```

3. **Test API endpoints:**
   - GET `/api/festivals/upcoming?userId=YOUR_USER_ID&daysAhead=30&country=IN`
   - GET `/api/festivals/list?userId=YOUR_USER_ID&country=IN`
   - GET `/api/festivals/notifications?userId=YOUR_USER_ID`

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Festival System Flow                     │
└─────────────────────────────────────────────────────────────┘

1. Weekly Sync (Cron)
   ↓
   Supabase Edge Function: festival-events
   ↓
   Calendarific API → Fetch festivals
   ↓
   Store in festival_events table

2. Daily Reminder Check (Cron)
   ↓
   Supabase Edge Function: festival-reminder
   ↓
   Query upcoming festivals
   ↓
   Generate AI notifications
   ↓
   Store in ai_notifications table

3. User Interaction
   ↓
   Tasks Page Calendar
   ↓
   Display festival events
   ↓
   Voice notifications (TTS)
   ↓
   User can enable/disable reminders
```

---

## 🗂️ Files Created

### Database Schema
- `src/lib/db/festival-schema.sql` - Complete database schema
- `deploy-festival-schema.ps1` - Deployment helper script

### Supabase Edge Functions
- `supabase/functions/festival-events/index.ts` - Festival data sync
- `supabase/functions/festival-reminder/index.ts` - Daily reminder generation

### TypeScript Types
- `src/lib/types/festival.ts` - Type definitions

### Service Layer
- `src/lib/services/festivalServiceServer.ts` - Server-side service
- `src/lib/services/festivalService.ts` - Client-side service

### API Routes
- `src/app/api/festivals/upcoming/route.ts` - Get upcoming festivals
- `src/app/api/festivals/list/route.ts` - List all festivals
- `src/app/api/festivals/toggle-reminder/route.ts` - Toggle reminders
- `src/app/api/festivals/notifications/route.ts` - Get notifications
- `src/app/api/festivals/notifications/update-status/route.ts` - Update notification status
- `src/app/api/festivals/preferences/route.ts` - Get user preferences
- `src/app/api/festivals/preferences/update/route.ts` - Update preferences
- `src/app/api/festivals/sync/route.ts` - Manual sync trigger

---

## 🔧 Configuration

### Environment Variables

Ensure these are set in `.env.local`:

```env
# Calendarific API (already set)
CALENDARIFIC_API_KEY=2VT5I4FRzaZfH3qxthwibn6rkxruEXZo

# Supabase (already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (already set)
OPENAI_API_KEY=your_openai_key
```

---

## 🎯 Next Steps

After deployment, you can:

1. **Integrate with Tasks Page Calendar** (Step 7 in implementation)
2. **Add Voice Notifications** (Step 8 in implementation)
3. **Test the complete flow**
4. **Monitor sync logs and notifications**

---

## 🐛 Troubleshooting

### Issue: Edge Functions not deploying

**Solution:**
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm update -g supabase

# Re-link project
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: Cron jobs not running

**Solution:**
1. Check Supabase Dashboard → Database → Cron Jobs
2. Verify the cron expression is correct
3. Check Edge Function logs for errors

### Issue: No festivals synced

**Solution:**
1. Check `festival_sync_log` table for errors
2. Verify Calendarific API key is correct
3. Check Edge Function logs
4. Manually trigger sync via API

---

## 📚 API Documentation

### Get Upcoming Festivals

```typescript
GET /api/festivals/upcoming?userId={userId}&daysAhead=30&country=IN

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Diwali",
      "event_date": "2025-11-01",
      "category": "religious",
      "days_until": 5
    }
  ]
}
```

### Toggle Festival Reminder

```typescript
PUT /api/festivals/toggle-reminder

Body:
{
  "userId": "uuid",
  "eventId": "uuid",
  "enabled": true
}

Response:
{
  "success": true,
  "message": "Festival reminder enabled",
  "data": { ... }
}
```

### Get Notifications

```typescript
GET /api/festivals/notifications?userId={userId}&status=pending

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Tomorrow is Diwali! 🪔",
      "message": "Would you like me to remind you to send greetings?",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

---

## ✅ Deployment Checklist

- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Edge Function secrets configured
- [ ] Cron jobs created and scheduled
- [ ] Initial festival data synced
- [ ] API endpoints tested
- [ ] RLS policies verified
- [ ] Sync logs checked

---

## 🎉 Success!

Your festival and events notification system is now deployed and ready to use!

The system will:
- ✅ Automatically sync festivals weekly
- ✅ Generate daily reminders for upcoming festivals
- ✅ Store notifications in the database
- ✅ Allow users to enable/disable reminders
- ✅ Provide AI-generated contextual messages

**Next:** Integrate the festival data into your Tasks page calendar UI!

