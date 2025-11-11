# 🧪 VOICE AUTOMATION PIPELINE - TESTING GUIDE

**Status**: ✅ READY FOR TESTING  
**Date**: 2025-11-08  
**Application**: http://localhost:3002  

---

## 🚀 QUICK START

### Step 1: Open Application
```
URL: http://localhost:3002
```

### Step 2: Open DevTools
```
Press: F12
Tab: Console
```

### Step 3: Grant Microphone Permission
```
Browser will ask for microphone access
Click: Allow
```

### Step 4: Start Testing
```
Say: "Hey Lara"
Then say a command
```

---

## 🎤 TEST SCENARIOS

### Test 1: Play Music

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "Play my favorite music"
4. Check console

**Expected Output**:
```
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: play my favorite music
🎤 Step 4: Classifying intent
✅ Intent classified: {intent: "play_music", musicQuery: "favorite music"}
🎤 Step 5: Routing action
🎵 Playing music: favorite music
✅ Now playing [Song Name]
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 2: Add Task

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "Add task buy groceries"
4. Check console

**Expected Output**:
```
🎤 Wake word detected! Starting pipeline...
✅ Transcribed text: add task buy groceries
✅ Intent classified: {intent: "add_task", taskText: "buy groceries"}
📝 Adding task: buy groceries
✅ Task added: buy groceries
✅ Pipeline completed successfully
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 3: Show Tasks

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "Show my tasks"
4. Check console and page

**Expected Output**:
```
✅ Intent classified: {intent: "show_tasks", navigationTarget: "/tasks"}
📋 Showing tasks
✅ Navigating to tasks
🧭 Navigating to: /tasks
```

**Expected Behavior**: Page navigates to `/tasks`

**Status**: [ ] PASS [ ] FAIL

---

### Test 4: Add Reminder

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "Add reminder call mom at 3pm"
4. Check console

**Expected Output**:
```
✅ Intent classified: {intent: "add_reminder", taskText: "call mom", time: "3pm"}
⏰ Adding reminder: call mom at 3pm
✅ Reminder set: call mom at 3pm
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 5: Show Reminders

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "Show my reminders"
4. Check console and page

**Expected Output**:
```
✅ Intent classified: {intent: "show_reminders", navigationTarget: "/reminders"}
📌 Showing reminders
✅ Navigating to reminders
🧭 Navigating to: /reminders
```

**Expected Behavior**: Page navigates to `/reminders`

**Status**: [ ] PASS [ ] FAIL

---

### Test 6: General Query

**Steps**:
1. Say: "Hey Lara"
2. Wait for: "Listening for command..."
3. Say: "What is the weather today"
4. Check console

**Expected Output**:
```
✅ Intent classified: {intent: "general_query", query: "What is the weather today"}
💬 General query: What is the weather today
✅ Query processed
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 7: Phonetic Variations

**Steps**:
1. Say: "Hey Laura" (instead of "Hey Lara")
2. Wait for: "Listening for command..."
3. Say: "Show tasks"
4. Check console

**Expected Output**:
```
✅ Wake word detected: hey laura
🎤 Wake word detected! Starting pipeline...
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 8: Sequential Commands

**Steps**:
1. Say: "Hey Lara"
2. Say: "Add task buy milk"
3. Wait for restart
4. Say: "Hey Lara"
5. Say: "Show tasks"
6. Check console

**Expected Output**:
```
[First command executes]
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
[Second command executes]
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 9: Error Handling

**Steps**:
1. Say: "Hey Lara"
2. Say nothing (silence)
3. Check console

**Expected Output**:
```
❌ Error classifying intent: [error message]
❌ Pipeline error: [error message]
🎤 Step 6: Restarting wake word listener
```

**Status**: [ ] PASS [ ] FAIL

---

### Test 10: Non-Wake-Word Phrase

**Steps**:
1. Say: "Hey Bob" (not a wake word)
2. Check console

**Expected Output**:
```
[No wake word detection]
[System continues listening]
```

**Status**: [ ] PASS [ ] FAIL

---

## 📊 TEST RESULTS SUMMARY

| Test | Scenario | Result |
|------|----------|--------|
| 1 | Play Music | [ ] PASS [ ] FAIL |
| 2 | Add Task | [ ] PASS [ ] FAIL |
| 3 | Show Tasks | [ ] PASS [ ] FAIL |
| 4 | Add Reminder | [ ] PASS [ ] FAIL |
| 5 | Show Reminders | [ ] PASS [ ] FAIL |
| 6 | General Query | [ ] PASS [ ] FAIL |
| 7 | Phonetic Variations | [ ] PASS [ ] FAIL |
| 8 | Sequential Commands | [ ] PASS [ ] FAIL |
| 9 | Error Handling | [ ] PASS [ ] FAIL |
| 10 | Non-Wake-Word | [ ] PASS [ ] FAIL |

---

## 🐛 TROUBLESHOOTING

### Issue: Wake word not detected

**Solution**:
1. Check microphone is connected
2. Check microphone permissions granted
3. Try speaking louder/clearer
4. Check browser console for errors
5. Refresh page (Ctrl+R)

### Issue: Command not recognized

**Solution**:
1. Speak clearly and slowly
2. Check console for transcribed text
3. Verify intent classification
4. Check Gemini API is working

### Issue: Action not executed

**Solution**:
1. Check console for action routing logs
2. Verify API endpoints exist
3. Check network tab for API calls
4. Check for JavaScript errors

### Issue: Navigation not working

**Solution**:
1. Verify component is CLIENT component
2. Check router.push() is called
3. Verify navigation target is correct
4. Check for routing errors in console

---

## 📝 CONSOLE LOGS REFERENCE

### Good Logs
```
🎤 Wake word detected! Starting pipeline...
🎤 Step 1: Stopping wake word listener
🎤 Step 2: Recording audio for 5 seconds
✅ Audio recorded
🎤 Step 3: Converting audio to text
✅ Transcribed text: [text]
🎤 Step 4: Classifying intent
✅ Intent classified: [intent]
🎤 Step 5: Routing action
✅ [Action executed]
✅ Pipeline completed successfully
🎤 Step 6: Restarting wake word listener
```

### Bad Logs (Should NOT See)
```
❌ Error classifying intent
❌ Error routing action
❌ Failed to transcribe audio
❌ Microphone permission denied
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Application running on port 3002
- [ ] DevTools open (F12)
- [ ] Console tab visible
- [ ] Microphone connected
- [ ] Microphone permissions granted
- [ ] All 10 tests completed
- [ ] No infinite loops
- [ ] No errors in console
- [ ] Actions executed correctly
- [ ] Navigation working

---

## 🎯 SUCCESS CRITERIA

✅ **All 10 tests pass**  
✅ **Actions executed correctly**  
✅ **Navigation working**  
✅ **No errors in console**  
✅ **Pipeline completes successfully**  
✅ **Wake word listener restarts**  

---

## 🚀 NEXT STEPS

1. Complete all test scenarios
2. Document any issues
3. Report results
4. Deploy to production if all tests pass

---

**Ready to test voice automation pipeline!** 🎤✨


