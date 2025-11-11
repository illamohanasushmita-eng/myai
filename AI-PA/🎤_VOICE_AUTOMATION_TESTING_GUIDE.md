# 🎤 Voice Automation Testing Guide

**Quick Reference for Testing Voice Automation Fixes**

---

## 🚀 Quick Start Testing

### Step 1: Open Browser Console
- Press `F12` to open Developer Tools
- Go to "Console" tab
- Keep it open while testing

### Step 2: Navigate to Dashboard
- Go to your dashboard page
- Look for the microphone button (voice command button)
- It should be visible and ready to use

### Step 3: Test Wake Word Detection

**Test Command**: Say "Hey Lara"

**Expected Results**:
- ✅ System responds with "Yes, how can I help?"
- ✅ Indicator shows "Listening..." (blue pulsing bars)
- ✅ Console shows: `✅ Wake word detected: hey lara`
- ✅ Console shows: `🎤 Calling onWakeWordDetected callback`

**Console Logs to Look For**:
```
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
```

---

## 🎯 Test Commands

### Test 1: Show Tasks
**Say**: "Hey Lara, show my tasks"

**Expected**:
- ✅ System navigates to /professional
- ✅ Tasks page opens
- ✅ Indicator hides after navigation
- ✅ System ready for next command

**Console Logs**:
```
🎤 Final transcript: hey lara show my tasks
✅ Wake word detected: hey lara
🎤 Command response received: {...}
🎤 Intent extracted: {intent: "show_tasks", ...}
🎤 Executing command: {intent: "show_tasks", ...}
🎤 Navigating to tasks
🎤 Restarting wake word listener after command execution
```

---

### Test 2: Show Reminders
**Say**: "Hey Lara, show my reminders"

**Expected**:
- ✅ System navigates to /reminders
- ✅ Reminders page opens
- ✅ Indicator hides after navigation
- ✅ System ready for next command

**Console Logs**:
```
🎤 Final transcript: hey lara show my reminders
✅ Wake word detected: hey lara
🎤 Command response received: {...}
🎤 Intent extracted: {intent: "show_reminders", ...}
🎤 Executing command: {intent: "show_reminders", ...}
🎤 Navigating to reminders
🎤 Restarting wake word listener after command execution
```

---

### Test 3: Play Music
**Say**: "Hey Lara, play a song"

**Expected**:
- ✅ System searches for music
- ✅ Music starts playing
- ✅ Indicator hides after music starts
- ✅ System ready for next command

**Console Logs**:
```
🎤 Final transcript: hey lara play a song
✅ Wake word detected: hey lara
🎤 Command response received: {...}
🎤 Intent extracted: {intent: "play_music", ...}
🎤 Executing command: {intent: "play_music", ...}
🎤 Playing music
🎤 Restarting wake word listener after command execution
```

---

### Test 4: Show Health
**Say**: "Hey Lara, show my health"

**Expected**:
- ✅ System navigates to /healthcare
- ✅ Health page opens
- ✅ Indicator hides after navigation
- ✅ System ready for next command

---

### Test 5: Show Professional
**Say**: "Hey Lara, show my professional"

**Expected**:
- ✅ System navigates to /professional
- ✅ Professional page opens
- ✅ Indicator hides after navigation
- ✅ System ready for next command

---

## 🔍 Visual Indicator Testing

### Test: Indicator Visibility

**Step 1**: Open dashboard
- ✅ Indicator should be HIDDEN (no blue pulsing bars)

**Step 2**: Say "Hey Lara"
- ✅ Indicator should show "Listening for 'Hey Lara'..." (blue pulsing)

**Step 3**: Say command (e.g., "show my tasks")
- ✅ Indicator should show "Listening..." (primary color pulsing)

**Step 4**: Wait for command execution
- ✅ Indicator should HIDE immediately after command execution

**Step 5**: Wait a moment
- ✅ Indicator should remain HIDDEN (waiting for next "Hey Lara")

---

## ✅ Verification Checklist

### Wake Word Detection
- [ ] "Hey Lara" is recognized
- [ ] System responds with voice feedback
- [ ] Indicator shows "Listening..."
- [ ] Console shows wake word detection logs

### Command Execution
- [ ] "show my tasks" navigates to tasks
- [ ] "show my reminders" navigates to reminders
- [ ] "play a song" plays music
- [ ] "show my health" navigates to health
- [ ] "show my professional" navigates to professional

### Indicator Behavior
- [ ] Indicator hidden when waiting for wake word
- [ ] Indicator shows when listening for command
- [ ] Indicator hides after command execution
- [ ] Indicator NOT continuously visible

### Continuous Listening
- [ ] After first command, system listens for next "Hey Lara"
- [ ] Can give multiple commands in sequence
- [ ] Each command executes properly
- [ ] No manual restart needed

### Error Handling
- [ ] If command fails, error message shows
- [ ] System automatically restarts listening
- [ ] Can try again after error

---

## 🐛 Troubleshooting

### Problem: Wake word not detected
**Solution**:
1. Check microphone permissions
2. Speak clearly and loudly
3. Check console for errors
4. Refresh page and try again

### Problem: Command not executing
**Solution**:
1. Check console for "🎤 Command response received:" log
2. Verify intent is being classified
3. Check for navigation errors
4. Try a different command

### Problem: Indicator still showing continuously
**Solution**:
1. Clear browser cache
2. Refresh the page
3. Check console for state management issues
4. Try a different browser

### Problem: System not responding
**Solution**:
1. Check microphone is working
2. Check internet connection
3. Check browser console for errors
4. Refresh page and try again

---

## 📊 Expected Console Output

### Successful Flow
```
🎤 Final transcript: hey lara show my tasks
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Command response received: {success: true, intent: {...}}
🎤 Intent extracted: {intent: "show_tasks", ...}
🎤 Executing command after delay
🎤 Executing command: {intent: "show_tasks", ...}
🎤 Navigating to tasks
🎤 Restarting wake word listener after command execution
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Starting wake word recognition again
```

### Error Flow
```
🎤 Final transcript: hey lara [unclear command]
✅ Wake word detected: hey lara
🎤 Command response received: {success: false, error: "..."}
🎤 Command failed: ...
🎤 Restarting wake word listener after error
```

---

## 🎉 Success Criteria

All of the following should be true:

✅ Wake word "Hey Lara" is detected  
✅ Commands are executed after wake word  
✅ Indicator shows only during active listening  
✅ Indicator hides after command execution  
✅ System automatically listens for next command  
✅ Multiple commands can be given in sequence  
✅ Console shows proper logging  
✅ No errors in console  

---

## 📞 Support

If you encounter any issues:

1. **Check console logs** - Look for error messages
2. **Check microphone** - Ensure it's working
3. **Check permissions** - Ensure microphone access is allowed
4. **Refresh page** - Try refreshing and testing again
5. **Try different browser** - Test in Chrome, Firefox, Safari, Edge

---

**Status**: ✅ READY FOR TESTING

Good luck! 🎤


