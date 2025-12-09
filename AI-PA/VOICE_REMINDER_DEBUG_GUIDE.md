# 🔍 Voice Reminder Debug Guide

## Quick Troubleshooting

### Problem: Reminder not being created

**Step 1: Check Intent Detection**
```bash
curl -X POST http://localhost:3002/api/intent \
  -H "Content-Type: application/json" \
  -d '{"text":"Remind me to call my mom tomorrow, 5:00 PM."}'
```

Expected:
```json
{
  "intent": "reminder_create",
  "entities": {
    "description": "call my mom tomorrow",
    "time": "5:00 pm."
  }
}
```

If `description` is empty → Entity extraction is broken
If `time` is wrong → Regex pattern needs fixing

**Step 2: Check Browser Console**

Open DevTools (F12) and look for these logs:

```
✅ Good logs:
📌 [REMINDER-VOICE] Starting reminder creation
📌 [REMINDER-VOICE] Converted timestamp: 2025-11-13T17:00:00.000Z
📌 [REMINDER-VOICE] API response status: 201
📌 [REMINDER-VOICE] Reminder created successfully

❌ Bad logs:
📌 [REMINDER-VOICE] Empty reminder text
📌 [REMINDER-VOICE] Missing userId
📌 [REMINDER-VOICE] Reminder creation failed: 400
```

**Step 3: Check Server Logs**

Look at terminal running `npm run dev`:

```
✅ Good logs:
[REMINDER-CREATE] Starting reminder creation...
[REMINDER-CREATE] Reminder data prepared for userId: ...
[REMINDER-CREATE] Reminder created successfully

❌ Bad logs:
[REMINDER-CREATE] Validation errors: ...
[REMINDER-CREATE] Database error: ...
```

**Step 4: Check Database**

```sql
-- Check if reminder was created
SELECT * FROM reminders 
WHERE user_id = '020cf70e-5fc8-431a-94ff-bd8b1eec400c'
ORDER BY created_at DESC LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'reminders';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'reminders';
```

## Common Issues & Solutions

### Issue 1: "Reminder not appearing in UI"

**Cause:** Reminder created but not fetched

**Solution:**
1. Check if `/api/reminders?userId=...` returns the reminder
2. Check if userId is stored in localStorage
3. Refresh the page

### Issue 2: "Entity extraction wrong"

**Cause:** Regex pattern doesn't match your phrase

**Solution:**
1. Test the regex at https://regex101.com
2. Update pattern in `src/lib/lara/cohere-intent.ts`
3. Test with API endpoint

### Issue 3: "Timestamp conversion wrong"

**Cause:** Time parsing failed

**Solution:**
1. Check console logs for `[CONVERT-TIMESTAMP]` messages
2. Verify time format (should be "HH:MM" or "H:MM am/pm")
3. Check if "tomorrow" keyword is detected

### Issue 4: "API returns 400 error"

**Cause:** Validation failed

**Solution:**
1. Check server logs for validation errors
2. Verify all required fields are present:
   - `title` (required)
   - `reminder_time` (required, must be ISO timestamp)
   - `userId` (required)
3. Check if user profile exists in database

### Issue 5: "API returns 500 error"

**Cause:** Database error

**Solution:**
1. Check server logs for database error details
2. Verify RLS policies are enabled
3. Verify user profile exists
4. Check if reminder_time is valid ISO timestamp

## Log Locations

### Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for logs starting with `📌 [REMINDER-VOICE]`

### Server Terminal
- Look for logs starting with `[REMINDER-CREATE]`
- Look for logs starting with `[CONVERT-TIMESTAMP]`

### Database Logs
- Supabase Dashboard → Logs
- Filter by table: `reminders`

## Testing Checklist

- [ ] Intent detection works (API returns correct intent)
- [ ] Entity extraction works (description and time extracted)
- [ ] Timestamp conversion works (ISO format)
- [ ] API call succeeds (status 201)
- [ ] Reminder saved to database
- [ ] Reminder appears in UI
- [ ] RLS policies allow access
- [ ] User profile exists

## Quick Test Commands

```bash
# Test intent detection
curl -X POST http://localhost:3002/api/intent \
  -H "Content-Type: application/json" \
  -d '{"text":"Remind me to call my mom tomorrow, 5:00 PM."}'

# Test reminder creation API
curl -X POST http://localhost:3002/api/reminders/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "call my mom",
    "reminder_time": "2025-11-13T17:00:00.000Z",
    "userId": "020cf70e-5fc8-431a-94ff-bd8b1eec400c",
    "status": "pending"
  }'

# Test reminder fetch
curl "http://localhost:3002/api/reminders?userId=020cf70e-5fc8-431a-94ff-bd8b1eec400c"
```

## Key Files to Check

1. **Entity Extraction:** `src/lib/lara/cohere-intent.ts` (Line 191)
2. **Intent Routing:** `src/lib/lara/intentRouter.ts` (Line 177)
3. **Reminder Creation:** `src/lib/voice/reminder-automation.ts` (Line 109)
4. **API Route:** `src/app/api/reminders/create/route.ts`
5. **Database Schema:** `supabase_tables_setup.sql`
6. **RLS Policies:** `supabase_rls_policies.sql`

## Expected Console Output

```
📌 [REMINDER-VOICE] Starting reminder creation
📌 [REMINDER-VOICE] Input - reminderText: call my mom tomorrow, 5:00 PM. userId: 020cf70e-5fc8-431a-94ff-bd8b1eec400c time: 5:00 pm.
📌 [CONVERT-TIMESTAMP] Converting text: call my mom tomorrow time: 5:00 pm.
📌 [CONVERT-TIMESTAMP] "tomorrow" detected, adding 1 day
📌 [CONVERT-TIMESTAMP] Parsed time from text: 17:00
📌 [CONVERT-TIMESTAMP] Setting time to 17 : 0
📌 [CONVERT-TIMESTAMP] Final ISO timestamp: 2025-11-13T17:00:00.000Z
📌 [REMINDER-VOICE] Converted timestamp: 2025-11-13T17:00:00.000Z
📌 [REMINDER-VOICE] Creating reminder with data: {title: "call my mom tomorrow, 5:00 PM", reminder_time: "2025-11-13T17:00:00.000Z", userId: "020cf70e-5fc8-431a-94ff-bd8b1eec400c", status: "pending"}
📌 [REMINDER-VOICE] API response status: 201
📌 [REMINDER-VOICE] Reminder creation response: {success: true, message: "Reminder created successfully", data: {...}}
📌 [REMINDER-VOICE] Reminder created successfully: [reminder_id]
📌 [REMINDER-VOICE] Navigating to reminders page...
```

## Need Help?

1. Check the logs first
2. Verify all files are modified correctly
3. Restart the dev server
4. Clear browser cache
5. Check database directly

