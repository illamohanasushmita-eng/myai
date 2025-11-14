# 🎉 Festival System - Quick Start Guide

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Deploy Database Schema (2 minutes)

```powershell
# Run the deployment script
.\deploy-festival-schema.ps1
```

This will:
- ✅ Copy SQL to clipboard
- ✅ Open Supabase Dashboard
- ✅ Paste in SQL Editor and click "Run"

---

### Step 2: Deploy Edge Functions (2 minutes)

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set CALENDARIFIC_API_KEY=2VT5I4FRzaZfH3qxthwibn6rkxruEXZo

# Deploy functions
supabase functions deploy festival-events
supabase functions deploy festival-reminder
```

---

### Step 3: Initial Data Sync (1 minute)

```bash
# Sync 2025 festivals for India
curl -X POST http://localhost:3002/api/festivals/sync \
  -H "Content-Type: application/json" \
  -d '{"country": "IN", "year": 2025}'
```

---

## ✅ Verify Deployment

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

---

## 📋 API Usage Examples

### Get Upcoming Festivals

```typescript
import { getUpcomingFestivals } from '@/lib/services/festivalService';

const festivals = await getUpcomingFestivals(userId, 30, 'IN');
console.log(festivals);
// [
//   {
//     id: "uuid",
//     name: "Diwali",
//     event_date: "2025-11-01",
//     category: "religious",
//     days_until: 5
//   }
// ]
```

### Toggle Festival Reminder

```typescript
import { toggleFestivalReminder } from '@/lib/services/festivalService';

await toggleFestivalReminder(userId, festivalId, true);
// Reminder enabled!
```

### Get Notifications

```typescript
import { getUserNotifications } from '@/lib/services/festivalService';

const notifications = await getUserNotifications(userId, {
  status: ['pending'],
  type: ['festival']
});
```

### Update User Preferences

```typescript
import { updateUserFestivalPreferences } from '@/lib/services/festivalService';

await updateUserFestivalPreferences(userId, {
  countries: ['IN', 'US'],
  enabled_categories: ['national', 'religious'],
  voice_notifications_enabled: true,
  days_before_notification: 2
});
```

---

## 🔧 Cron Jobs Setup

### Weekly Festival Sync (Sundays at 2 AM)

```sql
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

### Daily Reminders (Every day at 9 AM)

```sql
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

---

## 🎯 Common Tasks

### Add Custom Festival

```typescript
import { createFestivalEvent } from '@/lib/services/festivalService';

await createFestivalEvent(userId, {
  name: "My Birthday",
  description: "It's my special day!",
  event_date: "2025-12-25",
  category: "custom",
  country: "IN",
  reminder_enabled: true
});
```

### Check Sync Status

```sql
SELECT * FROM festival_sync_log 
ORDER BY created_at DESC 
LIMIT 5;
```

### View All Notifications

```sql
SELECT 
  n.title,
  n.message,
  n.status,
  f.name as festival_name,
  f.event_date
FROM ai_notifications n
LEFT JOIN festival_events f ON n.festival_event_id = f.id
WHERE n.user_id = 'YOUR_USER_ID'
ORDER BY n.created_at DESC;
```

---

## 🐛 Troubleshooting

### No festivals showing up?

```bash
# Check sync logs
SELECT * FROM festival_sync_log WHERE status = 'failed';

# Manually trigger sync
curl -X POST http://localhost:3002/api/festivals/sync \
  -H "Content-Type: "application/json" \
  -d '{"country": "IN", "year": 2025}'
```

### Edge Functions not working?

```bash
# Check function logs
supabase functions logs festival-events

# Redeploy
supabase functions deploy festival-events --no-verify-jwt
```

### Cron jobs not running?

```sql
-- Check cron jobs
SELECT * FROM cron.job;

-- Check cron job runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 📊 Database Helper Functions

### Get Upcoming Festivals (RPC)

```sql
SELECT * FROM get_upcoming_festivals(
  p_user_id := 'YOUR_USER_ID',
  p_days_ahead := 30,
  p_country := 'IN'
);
```

---

## 🎨 Integration Example (Future UI Work)

```typescript
// Example: Display festivals on calendar
import { getFestivals } from '@/lib/services/festivalService';

const CalendarWithFestivals = () => {
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    const loadFestivals = async () => {
      const data = await getFestivals(userId, {
        country: 'IN',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: true
      });
      setFestivals(data);
    };
    loadFestivals();
  }, [userId]);

  return (
    <Calendar
      events={[...tasks, ...festivals]}
      // ... other props
    />
  );
};
```

---

## 📚 Resources

- **Full Deployment Guide:** `FESTIVAL_SYSTEM_DEPLOYMENT_GUIDE.md`
- **Implementation Summary:** `FESTIVAL_SYSTEM_IMPLEMENTATION_SUMMARY.md`
- **Database Schema:** `src/lib/db/festival-schema.sql`
- **API Documentation:** See deployment guide

---

## ✅ Checklist

- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Secrets configured
- [ ] Initial sync completed
- [ ] Cron jobs created
- [ ] API endpoints tested
- [ ] Ready for UI integration

---

## 🎉 You're All Set!

The festival notification system is now ready to use. The backend will:

- ✅ Automatically sync festivals weekly
- ✅ Generate daily reminders at 9 AM
- ✅ Store notifications in database
- ✅ Provide API endpoints for your UI

**Next Step:** Integrate the festival data into your Tasks page calendar UI!

