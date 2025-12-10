# 🧪 QUICK TEST GUIDE - VOICE AUTOMATION FIXES

**Status**: ✅ READY TO TEST  
**Date**: 2025-11-08

---

## ⚡ 2-MINUTE SETUP

### Step 1: Start Application

```bash
npm run dev
```

### Step 2: Open Browser

```
http://localhost:3002
```

### Step 3: Open DevTools

```
Press: F12
Tab: Console
```

### Step 4: Grant Microphone Permission

```
Browser will ask for microphone access
Click: Allow
```

---

## 🎤 TEST 1: Wake Word Detection (No-Speech Error Fix)

**What to Test**: Verify "no-speech" error is handled gracefully

**Steps**:

1. Open DevTools Console
2. Say "Hey Lara"
3. Wait for wake word detection
4. If no speech detected, system should automatically restart

**Expected Console Output**:

```
🎤 Wake word listener started
🎤 Starting wake word recognition again
[If no speech detected]
🎤 No speech detected, restarting recognition...
🎤 Wake word listener started
```

**Expected Behavior**:

- ✅ No "no-speech" error shown to user
- ✅ System automatically restarts listening
- ✅ Ready for next wake word attempt

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 2: Show Tasks Navigation

**What to Test**: Verify action execution and navigation

**Steps**:

1. Say "Hey Lara"
2. Wait for "Listening for command..."
3. Say "show tasks"
4. Check if page navigates to /tasks

**Expected Console Output**:

```
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: show tasks
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "show_tasks", navigationTarget: "/tasks"}
🎤 Step 5: Routing action
📋 Showing tasks
✅ Navigating to tasks
🧭 Navigating to: /tasks
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
```

**Expected Behavior**:

- ✅ Page navigates to /tasks
- ✅ All pipeline steps logged
- ✅ Wake word listener restarts

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 3: Show Reminders Navigation

**What to Test**: Verify different navigation target

**Steps**:

1. Say "Hey Lara"
2. Say "show reminders"
3. Check if page navigates to /reminders

**Expected Behavior**:

- ✅ Page navigates to /reminders
- ✅ Pipeline completes successfully

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 4: Add Task

**What to Test**: Verify API action execution

**Steps**:

1. Say "Hey Lara"
2. Say "add task buy groceries"
3. Check console for success message

**Expected Console Output**:

```
✅ Intent classified: {intent: "add_task", taskText: "buy groceries"}
📝 Adding task: buy groceries
✅ Task added: buy groceries
```

**Expected Behavior**:

- ✅ Task is added to database
- ✅ Success message shown
- ✅ Wake word listener restarts

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 5: Add Reminder

**What to Test**: Verify reminder action

**Steps**:

1. Say "Hey Lara"
2. Say "add reminder call mom at 3pm"
3. Check console for success message

**Expected Console Output**:

```
✅ Intent classified: {intent: "add_reminder", taskText: "call mom", time: "3pm"}
⏰ Adding reminder: call mom at 3pm
✅ Reminder set: call mom at 3pm
```

**Expected Behavior**:

- ✅ Reminder is added
- ✅ Time is captured
- ✅ Success message shown

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 6: Play Music

**What to Test**: Verify Spotify integration

**Steps**:

1. Say "Hey Lara"
2. Say "play rock music"
3. Check console for music playing

**Expected Console Output**:

```
✅ Intent classified: {intent: "play_music", musicQuery: "rock music"}
🎵 Playing music: rock music
✅ Now playing [Song Name]
```

**Expected Behavior**:

- ✅ Music starts playing
- ✅ Song name shown in console
- ✅ Wake word listener restarts

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 7: Sequential Commands

**What to Test**: Verify pipeline restarts properly

**Steps**:

1. Say "Hey Lara"
2. Say "show tasks"
3. Wait for page to load
4. Say "Hey Lara" again
5. Say "show reminders"

**Expected Behavior**:

- ✅ First command executes
- ✅ Wake word listener restarts
- ✅ Second command executes
- ✅ No errors or infinite loops

**Status**: [ ] PASS [ ] FAIL

---

## 🎤 TEST 8: Error Handling

**What to Test**: Verify error recovery

**Steps**:

1. Say "Hey Lara"
2. Say nothing (silence)
3. Check console

**Expected Behavior**:

- ✅ System handles timeout gracefully
- ✅ No crash or infinite loop
- ✅ Ready for next command

**Status**: [ ] PASS [ ] FAIL

---

## 📊 TEST RESULTS SUMMARY

| Test | Scenario                    | Result            |
| ---- | --------------------------- | ----------------- |
| 1    | Wake Word (No-Speech Error) | [ ] PASS [ ] FAIL |
| 2    | Show Tasks Navigation       | [ ] PASS [ ] FAIL |
| 3    | Show Reminders Navigation   | [ ] PASS [ ] FAIL |
| 4    | Add Task                    | [ ] PASS [ ] FAIL |
| 5    | Add Reminder                | [ ] PASS [ ] FAIL |
| 6    | Play Music                  | [ ] PASS [ ] FAIL |
| 7    | Sequential Commands         | [ ] PASS [ ] FAIL |
| 8    | Error Handling              | [ ] PASS [ ] FAIL |

---

## 🐛 TROUBLESHOOTING

### Issue: Still seeing "no-speech" error

**Solution**:

- Refresh page (Ctrl+R)
- Check browser console for errors
- Verify microphone is working
- Try speaking louder/clearer

### Issue: Navigation not working

**Solution**:

- Check console for navigation logs
- Verify router.push is being called
- Check for JavaScript errors
- Verify page routes exist

### Issue: Commands not recognized

**Solution**:

- Speak clearly and slowly
- Check console for transcribed text
- Verify intent classification
- Check Gemini API is working

### Issue: Infinite loop or crash

**Solution**:

- Refresh page
- Check browser console for errors
- Verify all files are saved
- Restart development server

---

## ✅ SUCCESS CRITERIA

All tests should PASS:

- ✅ No "no-speech" errors
- ✅ All actions execute
- ✅ Navigation works
- ✅ Pipeline completes
- ✅ Wake word restarts
- ✅ Multiple commands work
- ✅ Error handling works

---

## 📞 SUPPORT

If tests fail:

1. Check console logs (F12)
2. Verify microphone permissions
3. Check network tab for API calls
4. Refresh page and retry
5. Check browser compatibility

---

**Ready to test!** 🎤✨
