# 🎤 Wake Word Testing Guide

**Status**: ✅ Ready to Test  
**Framework**: Next.js 15.5.6  
**Browser**: Chrome, Firefox, Safari, Edge  

---

## 🚀 Quick Start Testing

### Step 1: Start Development Server

```bash
npm run dev
```

Expected output:
```
> next dev
  ▲ Next.js 15.5.6
  - Local:        http://localhost:3000
```

### Step 2: Open Dashboard

1. Navigate to `http://localhost:3000`
2. Look for the microphone button (bottom right)
3. Open browser DevTools (F12)
4. Go to Console tab

### Step 3: Test Wake Word Detection

**Test Case 1: Basic Wake Word Detection**

1. Click the microphone button
2. Say clearly: "Hey Lara"
3. Wait for response

**Expected Console Output**:
```
🎤 Starting wake word listener
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Wake word recognition ended
🎤 Wake word detected, not restarting (waiting for command processing)
```

**Expected UI Behavior**:
- ✅ Microphone button shows listening state
- ✅ Blue indicator pulses (wake word mode)
- ✅ Feedback shows "Wake word detected! Listening for command..."
- ✅ Indicator changes to red (command mode)

---

## 🧪 Comprehensive Test Suite

### Test 1: No Infinite Loops

**Objective**: Verify no infinite restart loops

**Steps**:
1. Start listening
2. Wait 10 seconds without speaking
3. Check console

**Expected**:
```
🎤 Starting wake word listener
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
```

**NOT Expected** (infinite loop):
```
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
... (repeats 100+ times)
```

**Pass Criteria**: ✅ Restarts happen but are controlled (not infinite)

---

### Test 2: Wake Word Detection

**Objective**: Verify wake word is detected correctly

**Steps**:
1. Start listening
2. Say: "Hey Lara"
3. Check console and UI

**Expected Console**:
```
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Wake word recognition ended
🎤 Wake word detected, not restarting (waiting for command processing)
```

**Expected UI**:
- ✅ Feedback: "Wake word detected! Listening for command..."
- ✅ Indicator changes to red (command mode)
- ✅ Shows "Listening..." with bouncing dots

**Pass Criteria**: ✅ Wake word detected, command mode activated

---

### Test 3: Command Recognition

**Objective**: Verify command is recognized after wake word

**Steps**:
1. Say: "Hey Lara"
2. Wait for feedback
3. Say: "show my tasks"
4. Check console and UI

**Expected Console**:
```
🎤 Final transcript: show my tasks
🎤 Command response received: {...}
🎤 Intent extracted: {intent: "show_tasks", ...}
🎤 Executing command after delay
🎤 Executing command: {intent: "show_tasks", ...}
🎤 Navigating to tasks
```

**Expected UI**:
- ✅ Shows "You said: show my tasks"
- ✅ Shows "Processing your command..."
- ✅ Shows success feedback
- ✅ Navigates to /professional

**Pass Criteria**: ✅ Command recognized and executed

---

### Test 4: Return to Wake Word Mode

**Objective**: Verify system returns to wake word listening after command

**Steps**:
1. Execute a command (Test 3)
2. Wait for navigation
3. Check console

**Expected Console**:
```
🎤 Restarting wake word listener after command execution
🎤 Starting wake word listener
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
```

**Expected UI**:
- ✅ Microphone button returns to normal state
- ✅ Blue indicator shows (wake word mode)
- ✅ Feedback shows "Listening for 'Hey Lara'..."

**Pass Criteria**: ✅ System ready for next command

---

### Test 5: Multiple Commands in Sequence

**Objective**: Verify continuous operation

**Steps**:
1. Say: "Hey Lara"
2. Say: "show my reminders"
3. Wait for execution
4. Say: "Hey Lara"
5. Say: "play a song"
6. Wait for execution

**Expected**:
- ✅ First command executes
- ✅ System returns to wake word mode
- ✅ Second command executes
- ✅ No errors or infinite loops

**Pass Criteria**: ✅ Multiple commands work seamlessly

---

### Test 6: Error Handling

**Objective**: Verify error handling works

**Steps**:
1. Deny microphone permission
2. Try to start listening
3. Check console and UI

**Expected Console**:
```
❌ Error: Microphone permission denied
```

**Expected UI**:
- ✅ Shows error message
- ✅ Microphone button disabled
- ✅ No crashes

**Pass Criteria**: ✅ Errors handled gracefully

---

### Test 7: Component Unmount

**Objective**: Verify cleanup on unmount

**Steps**:
1. Start listening
2. Navigate away from page
3. Check console

**Expected**:
- ✅ No errors in console
- ✅ No memory leaks
- ✅ Listeners properly cleaned up

**Pass Criteria**: ✅ Clean unmount

---

## 📊 Console Log Checklist

### Startup Logs
- [ ] `🎤 Starting wake word listener`
- [ ] `🎤 Wake word recognition ended`
- [ ] `🎤 Restarting wake word listener...`
- [ ] `🎤 Starting wake word recognition again`

### Wake Word Detection Logs
- [ ] `🎤 Final transcript: hey lara`
- [ ] `✅ Wake word detected: hey lara`
- [ ] `🎤 Calling onWakeWordDetected callback`
- [ ] `🎤 Wake word recognition ended`
- [ ] `🎤 Wake word detected, not restarting`

### Command Processing Logs
- [ ] `🎤 Command response received: {...}`
- [ ] `🎤 Intent extracted: {intent: "...", ...}`
- [ ] `🎤 Executing command after delay`
- [ ] `🎤 Executing command: {...}`
- [ ] `🎤 Navigating to ...`

### Return to Wake Word Logs
- [ ] `🎤 Restarting wake word listener after command execution`
- [ ] `🎤 Starting wake word listener`
- [ ] `🎤 Wake word recognition ended`
- [ ] `🎤 Restarting wake word listener...`

---

## ❌ Issues to Watch For

### Issue 1: Infinite Restart Loop

**Symptom**: Console shows endless restart messages

**Solution**: Check that `enabledRef` is being synced properly

### Issue 2: Wake Word Not Detected

**Symptom**: Say "Hey Lara" but nothing happens

**Solution**: 
- Check microphone permission
- Speak clearly and loudly
- Check browser console for errors

### Issue 3: Command Not Executing

**Symptom**: Wake word detected but command doesn't execute

**Solution**:
- Check that `stopWakeWordListener()` is called
- Check that `activateFromWakeWord()` is called
- Check console for errors

### Issue 4: System Doesn't Return to Wake Word Mode

**Symptom**: After command, can't say "Hey Lara" again

**Solution**:
- Check that `setWakeWordActive(true)` is called
- Check that `startWakeWordListener()` is called
- Check console for errors

---

## 🎯 Success Criteria

All tests pass when:

- ✅ No infinite restart loops
- ✅ Wake word detected correctly
- ✅ Commands recognized and executed
- ✅ System returns to wake word mode
- ✅ Multiple commands work in sequence
- ✅ Errors handled gracefully
- ✅ Clean unmount with no memory leaks
- ✅ Console logs are clear and helpful

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Browser: ___________

Test 1: No Infinite Loops
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 2: Wake Word Detection
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 3: Command Recognition
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 4: Return to Wake Word Mode
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 5: Multiple Commands
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 6: Error Handling
Result: [ ] PASS [ ] FAIL
Notes: ___________

Test 7: Component Unmount
Result: [ ] PASS [ ] FAIL
Notes: ___________

Overall Result: [ ] PASS [ ] FAIL
```

---

## 🚀 Ready to Test!

Your wake word system is now fixed and ready for comprehensive testing.

**Start with Test 1** to verify no infinite loops, then proceed through the test suite.

**Good luck!** 🎤


