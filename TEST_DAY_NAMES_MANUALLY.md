# 🧪 Manual Testing Guide - Day Names in Voice Reminders

## Quick Test Cases

### Test 1: Monday Reminder (Next Upcoming)

**Command**: "Remind me to call my mom Monday"
**Expected**: Reminder set for next Monday at current time + 1 hour
**Check**:

- [ ] Reminder appears in "Upcoming" section
- [ ] Date is Monday
- [ ] Date is in the future (not past)
- [ ] Console shows `[GET-NEXT-DAY]` logs

### Test 2: Monday with Time

**Command**: "Remind me to call my mom Monday at 5 PM"
**Expected**: Reminder set for next Monday at 5:00 PM
**Check**:

- [ ] Reminder appears in "Upcoming" section
- [ ] Date is Monday
- [ ] Time is 5:00 PM
- [ ] Console shows both `[GET-NEXT-DAY]` and time parsing logs

### Test 3: Friday Reminder

**Command**: "Remind me to call my mom Friday at 3 PM"
**Expected**: Reminder set for next Friday at 3:00 PM
**Check**:

- [ ] Reminder appears in "Upcoming" section
- [ ] Date is Friday
- [ ] Time is 3:00 PM
- [ ] Never shows as overdue

### Test 4: Today is Monday, Say Monday

**Command**: "Remind me to call my mom Monday"
**Today**: Monday
**Expected**: Reminder set for NEXT Monday (7 days from now), NOT today
**Check**:

- [ ] Reminder date is 7 days from today
- [ ] NOT today's date
- [ ] Console shows `daysToAdd: 7`

### Test 5: Multiple Day Names (Uses First)

**Command**: "Remind me to call my mom Monday or Tuesday"
**Expected**: Reminder set for Monday (first match)
**Check**:

- [ ] Reminder date is Monday
- [ ] NOT Tuesday
- [ ] Console shows "Day name detected: monday"

### Test 6: Backward Compatibility - Tomorrow

**Command**: "Remind me to call my mom tomorrow at 5 PM"
**Expected**: Reminder set for tomorrow at 5:00 PM
**Check**:

- [ ] Still works as before
- [ ] Date is tomorrow
- [ ] Time is 5:00 PM

### Test 7: Backward Compatibility - Today

**Command**: "Remind me to call my mom today at 5 PM"
**Expected**: Reminder set for today at 5:00 PM
**Check**:

- [ ] Still works as before
- [ ] Date is today
- [ ] Time is 5:00 PM

## How to Run Tests

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Open Test Page

Go to: http://localhost:3002/test-lara

### Step 3: Run Each Test

1. Click "Start" button
2. Say "Hey Lara"
3. Say the test command
4. Check the results

### Step 4: Verify in Console

Press F12 to open browser console and look for:

- `📌 [CONVERT-TIMESTAMP]` logs
- `📌 [GET-NEXT-DAY]` logs
- `📌 [REMINDER-VOICE]` logs

### Step 5: Verify in Database

1. Go to Supabase dashboard
2. Check "reminders" table
3. Verify the reminder_time is correct

## Expected Console Output

### For "Remind me to call my mom Monday at 5 PM"

```
📌 [CONVERT-TIMESTAMP] Converting text: call my mom Monday at 5 PM time: undefined
📌 [CONVERT-TIMESTAMP] Day name detected: monday
📌 [GET-NEXT-DAY] Target day: monday (index: 1 ), Current day index: 2
📌 [GET-NEXT-DAY] Days to add: 6
📌 [GET-NEXT-DAY] Next occurrence of monday : Mon Nov 17 2025
📌 [CONVERT-TIMESTAMP] Parsed time from text: 17:00
📌 [CONVERT-TIMESTAMP] Final ISO timestamp: 2025-11-17T17:00:00.000Z
📌 [REMINDER-VOICE] Starting reminder creation
📌 [REMINDER-VOICE] Input - reminderText: call my mom Monday at 5 PM userId: [user-id] time: undefined
📌 [REMINDER-VOICE] Converted timestamp: 2025-11-17T17:00:00.000Z
📌 [REMINDER-VOICE] Creating reminder with data: {title: "call my mom Monday at 5 PM", reminder_time: "2025-11-17T17:00:00.000Z", userId: "[user-id]", status: "pending"}
📌 [REMINDER-VOICE] API response status: 200
📌 [REMINDER-VOICE] Reminder creation response: {success: true, data: {reminder_id: "..."}}
📌 [REMINDER-VOICE] Reminder created successfully: [reminder-id]
📌 [REMINDER-VOICE] Navigating to reminders page...
```

## Debugging Tips

### If reminder shows as overdue:

- Check the reminder_time in database
- Should be in the future
- If in the past, the date calculation is wrong

### If day name not recognized:

- Check console for `[GET-NEXT-DAY]` logs
- Should show the day name detected
- If not, the regex might not be matching

### If time not parsed:

- Check console for time parsing logs
- Should show `[CONVERT-TIMESTAMP] Parsed time from text: HH:MM`
- If not, the time format might not be recognized

### If reminder not created:

- Check API response status
- Should be 200
- Check for error messages in console
- Check Supabase logs

## Success Criteria

✅ All tests pass when:

- [ ] Day names are recognized (Monday-Sunday)
- [ ] Next upcoming occurrence is calculated
- [ ] Never returns past dates
- [ ] Time is parsed correctly
- [ ] Reminders appear in "Upcoming" section
- [ ] Backward compatibility maintained
- [ ] Console logs are detailed and helpful

## Troubleshooting

| Issue                   | Solution                         |
| ----------------------- | -------------------------------- |
| Day name not recognized | Check regex in cohere-intent.ts  |
| Past date returned      | Check getNextDayOfWeek logic     |
| Time not parsed         | Check parseTimeFromText function |
| Reminder not created    | Check API response and database  |
| Console logs missing    | Check browser console (F12)      |

## Notes

- Tests should be run on different days to verify the logic works correctly
- The system should never create reminders with past dates
- Day names should always resolve to the next upcoming occurrence
- Time parsing should support multiple formats (5 PM, 5:30 PM, 17:00, etc.)
