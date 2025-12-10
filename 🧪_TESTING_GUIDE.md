# 🧪 Testing Guide - Voice Assistant Lifecycle

## Pre-Testing Checklist

- [ ] Microphone is connected and working
- [ ] Browser supports Web Speech API (Chrome, Edge, Safari)
- [ ] Microphone permissions are granted
- [ ] Internet connection is stable
- [ ] No other apps using microphone
- [ ] Console is open (F12)

## Test 1: Basic Wake Word Detection

**Objective:** Verify wake word is detected on first attempt

**Steps:**

1. Open dashboard at `http://localhost:3002`
2. Check console for: `🎤 Starting wake word listener`
3. Wait for: `🎤 Wake word listener started`
4. Say clearly: "Hey Lara"
5. Check console for: `✅ Wake word detected: hey lara`

**Expected Result:**

```
🎤 Starting wake word listener
🎤 Wake word listener started
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Pipeline callback triggered from wake word listener
```

**Pass/Fail:** ✅ PASS if all messages appear

---

## Test 2: Complete Pipeline Execution

**Objective:** Verify entire pipeline executes after wake word

**Steps:**

1. Say "Hey Lara"
2. Wait for recording to start
3. Say command: "show my tasks"
4. Wait for navigation

**Expected Console Output:**

```
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: show my tasks
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "show_tasks", navigationTarget: "/tasks"}
🎤 Step 5: Routing action
📋 Showing tasks
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
🎤 Calling restartWakeWordListener
🎤 Explicitly restarting wake word listener
🎤 Starting wake word recognition again
🎤 Wake word listener started
```

**Expected UI:**

- Feedback message: "Wake word detected! Listening for command..."
- Feedback message: "Processing: show_tasks"
- Feedback message: "Navigating to tasks"
- Navigation to `/tasks` page

**Pass/Fail:** ✅ PASS if all steps execute and navigation works

---

## Test 3: Multiple Cycles

**Objective:** Verify listener re-activates and works multiple times

**Steps:**

1. Complete Test 2
2. Say "Hey Lara" again (should detect immediately)
3. Say command: "show reminders"
4. Wait for navigation to `/reminders`
5. Say "Hey Lara" again
6. Say command: "add task buy groceries"
7. Repeat 3-5 times

**Expected Result:**

- Each cycle completes successfully
- No "Wake word recognition ended" repeating messages
- Each "Restarting wake word listener" appears exactly once per cycle
- No errors in console

**Pass/Fail:** ✅ PASS if all cycles work without errors

---

## Test 4: Error Recovery

**Objective:** Verify system recovers from errors

**Steps:**

1. Disconnect microphone
2. Say "Hey Lara" (should fail)
3. Check console for error message
4. Reconnect microphone
5. Say "Hey Lara" (should work again)

**Expected Result:**

- Error message appears: "No microphone found"
- After reconnecting, system recovers
- Wake word detection works again

**Pass/Fail:** ✅ PASS if system recovers

---

## Test 5: Page Refresh

**Objective:** Verify listener survives page refresh

**Steps:**

1. Say "Hey Lara" (should work)
2. Refresh page (F5)
3. Wait for page to load
4. Say "Hey Lara" (should work immediately)

**Expected Result:**

- Listener auto-starts after refresh
- Wake word detected without manual button click
- No errors in console

**Pass/Fail:** ✅ PASS if listener auto-starts

---

## Test 6: Console Log Verification

**Objective:** Verify console logs match expected pattern

**Steps:**

1. Open console (F12)
2. Filter for "🎤" emoji
3. Say "Hey Lara" and complete a command
4. Review all logs

**Expected Pattern:**

```
🎤 Starting wake word listener
🎤 Wake word listener started
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Pipeline callback triggered from wake word listener
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: [command]
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "[intent]"}
🎤 Step 5: Routing action
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
🎤 Calling restartWakeWordListener
🎤 Explicitly restarting wake word listener
🎤 Starting wake word recognition again
🎤 Wake word listener started
```

**Pass/Fail:** ✅ PASS if pattern matches exactly

---

## Test 7: No Repeating Messages

**Objective:** Verify no repeating "Wake word recognition ended"

**Steps:**

1. Open console
2. Say "Hey Lara" and complete command
3. Wait 10 seconds
4. Search console for "Wake word recognition ended"

**Expected Result:**

- Message appears 0-1 times (not repeating)
- No error messages
- Listener is still active

**Pass/Fail:** ✅ PASS if no repeating messages

---

## Test 8: Navigation Verification

**Objective:** Verify navigation works for all intents

**Steps:**

1. Say "Hey Lara" → "show my tasks" → verify `/tasks`
2. Say "Hey Lara" → "show reminders" → verify `/reminders`
3. Say "Hey Lara" → "navigate to dashboard" → verify `/dashboard`

**Expected Result:**

- Each navigation works correctly
- URL changes to expected route
- Page content updates

**Pass/Fail:** ✅ PASS if all navigations work

---

## Test 9: Microphone Button State

**Objective:** Verify button shows correct state

**Steps:**

1. Check button on dashboard
2. Verify button is red and pulsing (listening)
3. Say "Hey Lara"
4. Verify button changes state during recording
5. Wait for pipeline to complete
6. Verify button returns to red and pulsing

**Expected Result:**

- Button shows active state (red pulse) when listening
- Button changes during recording
- Button returns to listening state after pipeline

**Pass/Fail:** ✅ PASS if button states are correct

---

## Test 10: Stress Test

**Objective:** Verify system handles rapid commands

**Steps:**

1. Say "Hey Lara" → command
2. Immediately after navigation, say "Hey Lara" → command
3. Repeat 10 times rapidly
4. Check for errors or crashes

**Expected Result:**

- All commands execute successfully
- No errors or crashes
- No memory leaks
- Console remains clean

**Pass/Fail:** ✅ PASS if system handles stress

---

## Troubleshooting During Testing

### Issue: Wake word not detected

**Solution:**

- Speak louder and clearer
- Check microphone is working
- Try different wake word variations
- Check browser console for errors

### Issue: Actions not executing

**Solution:**

- Check console for error messages
- Verify intent classification
- Check network connection
- Verify API endpoints are working

### Issue: Listener stops

**Solution:**

- Check console for "Wake word recognition ended"
- Verify restartWakeWordListener is called
- Check for JavaScript errors
- Refresh page and try again

### Issue: Navigation not working

**Solution:**

- Check browser console for errors
- Verify router is working
- Check navigation target in intent
- Verify page exists

---

## Test Results Summary

| Test                     | Status | Notes |
| ------------------------ | ------ | ----- |
| 1. Wake Word Detection   | ⬜     |       |
| 2. Pipeline Execution    | ⬜     |       |
| 3. Multiple Cycles       | ⬜     |       |
| 4. Error Recovery        | ⬜     |       |
| 5. Page Refresh          | ⬜     |       |
| 6. Console Logs          | ⬜     |       |
| 7. No Repeating Messages | ⬜     |       |
| 8. Navigation            | ⬜     |       |
| 9. Button State          | ⬜     |       |
| 10. Stress Test          | ⬜     |       |

**Overall Status:** ⬜ PENDING

---

## Sign-Off

- **Tester:** ******\_\_\_******
- **Date:** ******\_\_\_******
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** ******\_\_\_******

---

**Ready to test!** 🎤✨
