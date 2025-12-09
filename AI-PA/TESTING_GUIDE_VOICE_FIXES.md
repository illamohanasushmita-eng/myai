# Voice Assistant Fixes - Testing Guide

## Prerequisites
- Dev server running: `npm run dev` (port 3002)
- Browser console open (F12)
- Microphone enabled
- Supabase connection working

---

## Test 1: Reminder Text Transformation

### Steps
1. Open browser console (F12)
2. Navigate to reminders page
3. Click microphone button
4. Say: **"add reminder to call my mom"**
5. Wait for response

### Expected Results
- **Console Output**:
  ```
  📌 [REMINDER-TRANSFORM] Original: "add reminder to call my mom" → Transformed: "Call your mom"
  📌 [REMINDER-VOICE] Providing voice feedback: "Reminder added"
  ```
- **Audio**: Hear "Reminder added"
- **UI**: Reminder appears with text "Call your mom"
- **Database**: Supabase shows reminder with title "Call your mom"

### Variations to Test
- "remind me to buy milk" → "Buy milk"
- "remind me to pay bills tomorrow" → "Pay your bills tomorrow"
- "add reminder I need to finish my report" → "You need to finish your report"
- "set reminder to call my mom" → "Call your mom"

---

## Test 2: Reminder Creation Voice Feedback

### Steps
1. Open browser console (F12)
2. Navigate to reminders page
3. Click microphone button
4. Say: **"add reminder to call my mom"**
5. Listen for audio feedback

### Expected Results
- **Audio**: Hear "Reminder added" BEFORE page navigation
- **Console Output**:
  ```
  📌 [REMINDER-VOICE] Providing voice feedback: "Reminder added"
  📌 [REMINDER-VOICE] Navigating to reminders page...
  ```
- **UI**: Reminder appears immediately
- **Timing**: Feedback should play within 1-2 seconds

---

## Test 3: Task Creation Voice Feedback

### Steps
1. Open browser console (F12)
2. Navigate to tasks page
3. Click microphone button
4. Say: **"add task to buy flowers"**
5. Listen for audio feedback

### Expected Results
- **Audio**: Hear "Task added" BEFORE page navigation
- **Console Output**:
  ```
  📝 [TASK-VOICE] Providing voice feedback: "Task added"
  📝 [TASK-VOICE] Navigating to tasks page with refresh...
  ```
- **UI**: Task appears in "Today" section
- **Timing**: Feedback should play within 1-2 seconds

---

## Test 4: Navigation Voice Feedback

### Test 4a: Open Tasks
1. Open browser console (F12)
2. Click microphone button
3. Say: **"show me my tasks"**
4. Listen for audio feedback

**Expected Results**:
- **Audio**: Hear "Opening tasks"
- **Console Output**:
  ```
  📋 Opening tasks page
  📋 TTS error (non-critical): [if any]
  ```
- **Navigation**: Navigate to /tasks page

### Test 4b: Open Reminders
1. Open browser console (F12)
2. Click microphone button
3. Say: **"open reminders"**
4. Listen for audio feedback

**Expected Results**:
- **Audio**: Hear "Opening reminders"
- **Console Output**:
  ```
  📌 Opening reminders page
  📌 TTS error (non-critical): [if any]
  ```
- **Navigation**: Navigate to /reminders page

---

## Test 5: Multiple Reminders with Transformation

### Steps
1. Open browser console (F12)
2. Navigate to reminders page
3. Say: **"add reminder to call my mom"**
4. Wait for confirmation
5. Say: **"add reminder to buy groceries"**
6. Wait for confirmation
7. Say: **"add reminder I need to finish my report"**
8. Wait for confirmation

### Expected Results
- **Console Output** (3 transformation logs):
  ```
  📌 [REMINDER-TRANSFORM] Original: "add reminder to call my mom" → Transformed: "Call your mom"
  📌 [REMINDER-TRANSFORM] Original: "add reminder to buy groceries" → Transformed: "Buy groceries"
  📌 [REMINDER-TRANSFORM] Original: "add reminder I need to finish my report" → Transformed: "You need to finish your report"
  ```
- **Audio**: Hear "Reminder added" three times
- **UI**: All three reminders appear with transformed text
- **Database**: All three reminders stored with transformed text

---

## Test 6: Error Handling

### Test 6a: Empty Reminder
1. Say: **"add reminder"** (without text)
2. Check console for error handling

**Expected**: Error message, no reminder created

### Test 6b: Network Error
1. Disable network (DevTools → Network → Offline)
2. Say: **"add reminder to call my mom"**
3. Check console for error handling

**Expected**: Error message, graceful fallback

---

## Console Log Reference

### Successful Reminder Creation
```
📌 [REMINDER-VOICE] Starting reminder creation
📌 [REMINDER-VOICE] Input - reminderText: "add reminder to call my mom"
📌 [REMINDER-TRANSFORM] Original: "add reminder to call my mom" → Transformed: "Call your mom"
📌 [REMINDER-VOICE] Creating reminder with data: {title: "Call your mom", ...}
📌 [REMINDER-VOICE] Reminder created successfully: [reminder_id]
📌 [REMINDER-VOICE] Providing voice feedback: "Reminder added"
📌 [REMINDER-VOICE] Navigating to reminders page...
```

### Successful Task Creation
```
📝 [TASK-VOICE] Starting task creation process...
📝 [TASK-VOICE] Task created successfully, now providing voice feedback...
📝 [TASK-VOICE] Providing voice feedback: "Task added"
📝 [TASK-VOICE] Now navigating to tasks page...
✅ [TASK-VOICE] Task voice function completed successfully
```

### Navigation Feedback
```
📋 Opening tasks page
📋 Using onNavigate callback
📋 onNavigate callback executed (45ms)
📋 TTS error (non-critical): [if any]
```

---

## Troubleshooting

### No Audio Feedback
- Check browser volume
- Check microphone permissions
- Check console for TTS errors
- Verify `speak()` function is being called

### Text Not Transformed
- Check console for transformation log
- Verify command phrases are being removed
- Check database for stored text

### Navigation Not Working
- Check console for navigation logs
- Verify router context is available
- Check for JavaScript errors

### Multiple Reminders Not Appearing
- Check optimistic UI update logs
- Verify reminders are being added to state
- Check for duplicate prevention logic

---

## Success Criteria

✅ All tests pass when:
1. Reminder text is transformed from first-person to second-person
2. Voice feedback plays for reminder creation ("Reminder added")
3. Voice feedback plays for task creation ("Task added")
4. Voice feedback plays for navigation ("Opening tasks", "Opening reminders")
5. Multiple reminders can be created with proper transformation
6. Console logs show all transformation and feedback steps
7. Database stores transformed text
8. UI displays transformed text
9. No errors in console
10. All feedback is non-blocking and graceful

