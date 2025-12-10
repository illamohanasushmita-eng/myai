# IST Timezone Quick Reference

## What Changed?

All voice reminders now use **Asia/Kolkata timezone (IST, UTC+5:30)** instead of UTC.

## Output Format

### Before ❌

```
2025-11-12T04:00:00.000Z  (UTC)
```

### After ✅

```
2025-11-12T09:00:00+05:30  (IST)
```

## Default Times (IST)

| Command             | Default Time |
| ------------------- | ------------ |
| "tomorrow"          | 09:00 AM     |
| "today"             | 09:00 AM     |
| "tonight"           | 08:00 PM     |
| "evening"           | 07:00 PM     |
| "afternoon"         | 03:00 PM     |
| "Monday" (day name) | 09:00 AM     |

## Example Commands

### 1. Tomorrow at default time

```
User: "add reminder to write notebook tomorrow"
Result: 2025-11-12T09:00:00+05:30
```

### 2. Tonight at default time

```
User: "add reminder to call mom tonight"
Result: 2025-11-11T20:00:00+05:30
```

### 3. Tomorrow with explicit time

```
User: "add reminder to attend meeting tomorrow at 5 PM"
Result: 2025-11-12T17:00:00+05:30
```

### 4. Day name with explicit time

```
User: "add reminder to call client Monday at 3 PM"
Result: 2025-11-18T15:00:00+05:30
```

### 5. This afternoon

```
User: "add reminder to review proposal this afternoon"
Result: 2025-11-11T15:00:00+05:30
```

## Key Features

✅ **IST Timezone** - All calculations in Asia/Kolkata (UTC+5:30)
✅ **Default Times** - Smart defaults for relative date expressions
✅ **Explicit Times** - Parse and apply user-specified times
✅ **Past Time Handling** - Auto-adjust if time has already passed
✅ **ISO 8601 Format** - Standard format with +05:30 offset
✅ **No UTC** - Never outputs Z or +00:00

## Testing

### Verify IST Format

```typescript
const result = convertToISOTimestamp("write notebook tomorrow");
// Should match: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/
// Should NOT match: /Z$/ or /\+00:00$/
```

### Verify Default Time

```typescript
const result = convertToISOTimestamp("write notebook tomorrow");
// Extract time: result.match(/T(\d{2}):(\d{2}):/);
// Should be: 09:00
```

### Verify Explicit Time

```typescript
const result = convertToISOTimestamp("write notebook tomorrow at 5 PM");
// Extract time: result.match(/T(\d{2}):(\d{2}):/);
// Should be: 17:00
```

## Console Logs

Look for these logs to verify IST timezone is working:

```
📌 [CONVERT-TIMESTAMP] Converting text: ... (IST timezone)
📌 [CONVERT-TIMESTAMP] "tomorrow" detected in timeStr (IST)
📌 [CONVERT-TIMESTAMP] Using default time for tomorrow: 9:0 (IST)
📌 [CONVERT-TIMESTAMP] Final ISO timestamp (IST): 2025-11-12T09:00:00+05:30
```

## Database Storage

Reminders are stored in the database with IST timestamps:

```sql
-- Example reminder in database
INSERT INTO reminders (title, reminder_time, user_id)
VALUES (
  'Write notebook',
  '2025-11-12T09:00:00+05:30',  -- IST format
  'user-123'
);
```

## Timezone Conversion Reference

| IST Time     | UTC Time     |
| ------------ | ------------ |
| 09:00 AM IST | 03:30 AM UTC |
| 12:00 PM IST | 06:30 AM UTC |
| 03:00 PM IST | 09:30 AM UTC |
| 05:00 PM IST | 11:30 AM UTC |
| 08:00 PM IST | 02:30 PM UTC |

## Common Issues & Solutions

### Issue: Timestamp shows Z instead of +05:30

**Solution:** Use `convertToISOTimestamp()` function, not `toISOString()`

### Issue: Time is off by 5.5 hours

**Solution:** Verify IST offset is being applied correctly in calculations

### Issue: "tonight" reminder appears in past

**Solution:** System auto-adjusts to tomorrow if time has passed

### Issue: Day name shows wrong date

**Solution:** Verify `getNextDayOfWeek()` is calculating correctly for IST

## Files to Reference

- **Implementation:** `src/lib/voice/reminder-automation.ts`
- **Tests:** `src/lib/voice/__tests__/reminder-automation.test.ts`
- **Documentation:** `IST_TIMEZONE_IMPLEMENTATION_COMPLETE.md`

## Support

For questions or issues with IST timezone implementation:

1. Check console logs for detailed timestamp conversion info
2. Review test cases in `reminder-automation.test.ts`
3. Verify database stores timestamps with +05:30 offset
