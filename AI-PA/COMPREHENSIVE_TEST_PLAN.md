# 🧪 Comprehensive Test Plan - Day Names Fix

## Pre-Test Setup

1. **Restart dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser console**:
   - Press F12
   - Go to Console tab
   - Keep it open during testing

3. **Open test page**:
   - Go to http://localhost:3002/test-lara
   - Click "Start" button

## Test Suite 1: Day Names Only

### Test 1.1: Monday
**Command**: "Remind me Monday"

**Expected**:
- Console: `📌 Time: monday Length: 6`
- Console: `📌 [GET-NEXT-DAY] Days to add: [X]`
- UI: Reminder appears in "Upcoming" section
- Date: Next Monday

**Status**: [ ] Pass [ ] Fail

### Test 1.2: Tuesday
**Command**: "Remind me Tuesday"

**Expected**:
- Console: `📌 Time: tuesday Length: 7`
- Console: `📌 [GET-NEXT-DAY] Days to add: [X]`
- UI: Reminder appears in "Upcoming" section
- Date: Next Tuesday

**Status**: [ ] Pass [ ] Fail

### Test 1.3: Wednesday
**Command**: "Remind me Wednesday"

**Expected**:
- Console: `📌 Time: wednesday Length: 9`
- UI: Reminder appears in "Upcoming" section
- Date: Next Wednesday

**Status**: [ ] Pass [ ] Fail

### Test 1.4: Thursday
**Command**: "Remind me Thursday"

**Expected**:
- Console: `📌 Time: thursday Length: 8`
- UI: Reminder appears in "Upcoming" section
- Date: Next Thursday

**Status**: [ ] Pass [ ] Fail

### Test 1.5: Friday
**Command**: "Remind me Friday"

**Expected**:
- Console: `📌 Time: friday Length: 6`
- UI: Reminder appears in "Upcoming" section
- Date: Next Friday

**Status**: [ ] Pass [ ] Fail

### Test 1.6: Saturday
**Command**: "Remind me Saturday"

**Expected**:
- Console: `📌 Time: saturday Length: 8`
- UI: Reminder appears in "Upcoming" section
- Date: Next Saturday

**Status**: [ ] Pass [ ] Fail

### Test 1.7: Sunday
**Command**: "Remind me Sunday"

**Expected**:
- Console: `📌 Time: sunday Length: 6`
- UI: Reminder appears in "Upcoming" section
- Date: Next Sunday

**Status**: [ ] Pass [ ] Fail

## Test Suite 2: Day Names with Description

### Test 2.1: With Action
**Command**: "Remind me to attend the meeting Tuesday"

**Expected**:
- Console: `📌 Description: attend the meeting Length: 18`
- Console: `📌 Time: tuesday Length: 7`
- UI: Reminder title: "attend the meeting"
- UI: Date: Next Tuesday

**Status**: [ ] Pass [ ] Fail

### Test 2.2: With Different Action
**Command**: "Remind me to call my mom Monday"

**Expected**:
- Console: `📌 Description: call my mom Length: 11`
- Console: `📌 Time: monday Length: 6`
- UI: Reminder title: "call my mom"
- UI: Date: Next Monday

**Status**: [ ] Pass [ ] Fail

### Test 2.3: With Long Description
**Command**: "Remind me to prepare presentation for client meeting Friday"

**Expected**:
- Console: `📌 Description: prepare presentation for client meeting Length: [X]`
- Console: `📌 Time: friday Length: 6`
- UI: Reminder title: "prepare presentation for client meeting"
- UI: Date: Next Friday

**Status**: [ ] Pass [ ] Fail

## Test Suite 3: Day Names with Time

### Test 3.1: Day + Time (AM)
**Command**: "Remind me Tuesday at 9 AM"

**Expected**:
- Console: `📌 Time: tuesday at 9 am Length: [X]`
- Console: `📌 [CONVERT-TIMESTAMP] Parsed time from text: 09:00`
- UI: Date: Next Tuesday
- UI: Time: 9:00 AM

**Status**: [ ] Pass [ ] Fail

### Test 3.2: Day + Time (PM)
**Command**: "Remind me Friday at 3 PM"

**Expected**:
- Console: `📌 Time: friday at 3 pm Length: [X]`
- Console: `📌 [CONVERT-TIMESTAMP] Parsed time from text: 15:00`
- UI: Date: Next Friday
- UI: Time: 3:00 PM

**Status**: [ ] Pass [ ] Fail

### Test 3.3: Day + Time with Minutes
**Command**: "Remind me Wednesday at 5:30 PM"

**Expected**:
- Console: `📌 Time: wednesday at 5:30 pm Length: [X]`
- Console: `📌 [CONVERT-TIMESTAMP] Parsed time from text: 17:30`
- UI: Date: Next Wednesday
- UI: Time: 5:30 PM

**Status**: [ ] Pass [ ] Fail

### Test 3.4: Day + Description + Time
**Command**: "Remind me to call my mom Tuesday at 5 PM"

**Expected**:
- Console: `📌 Description: call my mom tuesday Length: [X]`
- Console: `📌 Time: 5 pm Length: 4`
- UI: Reminder title: "call my mom tuesday"
- UI: Date: Next Tuesday
- UI: Time: 5:00 PM

**Status**: [ ] Pass [ ] Fail

## Test Suite 4: Backward Compatibility

### Test 4.1: Tomorrow
**Command**: "Remind me tomorrow"

**Expected**:
- Console: `📌 [CONVERT-TIMESTAMP] "tomorrow" detected`
- UI: Date: Tomorrow
- UI: Time: Current time + 1 hour

**Status**: [ ] Pass [ ] Fail

### Test 4.2: Tomorrow with Time
**Command**: "Remind me tomorrow at 5 PM"

**Expected**:
- Console: `📌 [CONVERT-TIMESTAMP] "tomorrow" detected`
- UI: Date: Tomorrow
- UI: Time: 5:00 PM

**Status**: [ ] Pass [ ] Fail

### Test 4.3: Today
**Command**: "Remind me today at 5 PM"

**Expected**:
- Console: `📌 [CONVERT-TIMESTAMP] "today" detected`
- UI: Date: Today
- UI: Time: 5:00 PM

**Status**: [ ] Pass [ ] Fail

### Test 4.4: Tonight
**Command**: "Remind me tonight at 8 PM"

**Expected**:
- Console: `📌 [CONVERT-TIMESTAMP] "tonight" detected`
- UI: Date: Today
- UI: Time: 8:00 PM

**Status**: [ ] Pass [ ] Fail

## Test Suite 5: Edge Cases

### Test 5.1: Today is Monday, Say Monday
**Command**: "Remind me Monday" (when today is Monday)

**Expected**:
- Console: `📌 [GET-NEXT-DAY] Days to add: 7`
- UI: Date: Next Monday (7 days from now)
- NOT today

**Status**: [ ] Pass [ ] Fail

### Test 5.2: Case Insensitivity
**Command**: "Remind me TUESDAY"

**Expected**:
- Console: `📌 Time: tuesday Length: 7` (lowercase)
- UI: Date: Next Tuesday

**Status**: [ ] Pass [ ] Fail

### Test 5.3: Mixed Case
**Command**: "Remind me To Attend Meeting Tuesday"

**Expected**:
- Console: `📌 Description: attend meeting Length: [X]`
- Console: `📌 Time: tuesday Length: 7`
- UI: Date: Next Tuesday

**Status**: [ ] Pass [ ] Fail

## Test Suite 6: Database Verification

### Test 6.1: Check Reminder in Database
1. Create reminder: "Remind me Tuesday at 3 PM"
2. Go to Supabase dashboard
3. Check "reminders" table
4. Find the reminder

**Expected**:
- `reminder_time`: Future ISO timestamp (e.g., 2025-11-18T15:00:00.000Z)
- `status`: "pending"
- `title`: "remind me tuesday at 3 pm" or similar

**Status**: [ ] Pass [ ] Fail

### Test 6.2: Check Multiple Reminders
Create 3 reminders with different days:
- "Remind me Monday"
- "Remind me Wednesday"
- "Remind me Friday"

**Expected**:
- All have future dates
- All have different dates (Monday, Wednesday, Friday)
- All have status "pending"

**Status**: [ ] Pass [ ] Fail

## Summary

### Total Tests: 26
- [ ] Passed: ___
- [ ] Failed: ___
- [ ] Skipped: ___

### Issues Found
```
[List any issues found during testing]
```

### Recommendations
```
[List any recommendations or improvements]
```

## Sign-Off

- **Tested By**: _______________
- **Date**: _______________
- **Status**: [ ] PASS [ ] FAIL

## Notes

```
[Additional notes or observations]
```

