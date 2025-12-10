# 🧪 PHONETIC VARIATIONS - TESTING GUIDE

**Status**: ✅ READY FOR TESTING  
**Date**: 2025-11-08  
**Application**: http://localhost:3002  
**Feature**: 6 phonetic variations of "Hey Lara"

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
Say any of the 6 variations
Check console for detection
```

---

## 🎤 TESTING VARIATIONS

### Variation 1: "Hey Lara" (Original)

**Steps**:

1. Say: "Hey Lara"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

### Variation 2: "Hey Laura"

**Steps**:

1. Say: "Hey Laura"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey laura
✅ Wake word detected: hey laura
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

### Variation 3: "Hey Lora"

**Steps**:

1. Say: "Hey Lora"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey lora
✅ Wake word detected: hey lora
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

### Variation 4: "Hey Larra"

**Steps**:

1. Say: "Hey Larra"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey larra
✅ Wake word detected: hey larra
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

### Variation 5: "Hey Laira"

**Steps**:

1. Say: "Hey Laira"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey laira
✅ Wake word detected: hey laira
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

### Variation 6: "Hey Lera"

**Steps**:

1. Say: "Hey Lera"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey lera
✅ Wake word detected: hey lera
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

**Status**: [ ] PASS [ ] FAIL

---

## ❌ NEGATIVE TEST

### Non-matching Phrase: "Hey Bob"

**Steps**:

1. Say: "Hey Bob"
2. Check console

**Expected Output**:

```
🎤 Final transcript: hey bob
[No wake word detection message]
[System continues listening]
```

**Status**: [ ] PASS [ ] FAIL

---

## 🔄 FULL WORKFLOW TEST

### Test: Wake Word + Command

**Steps**:

1. Say: "Hey Lara"
2. Wait for: "Wake word detected"
3. Say: "show my tasks"
4. Check console

**Expected Output**:

```
🎤 Final transcript: hey lara
✅ Wake word detected: hey lara
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
[Command listening starts]
🎤 Command response received
🎤 Intent extracted
🎤 Executing command
```

**Status**: [ ] PASS [ ] FAIL

---

## 📊 TEST RESULTS SUMMARY

| Variation     | Test        | Result            |
| ------------- | ----------- | ----------------- |
| hey lara      | Variation 1 | [ ] PASS [ ] FAIL |
| hey laura     | Variation 2 | [ ] PASS [ ] FAIL |
| hey lora      | Variation 3 | [ ] PASS [ ] FAIL |
| hey larra     | Variation 4 | [ ] PASS [ ] FAIL |
| hey laira     | Variation 5 | [ ] PASS [ ] FAIL |
| hey lera      | Variation 6 | [ ] PASS [ ] FAIL |
| hey bob       | Negative    | [ ] PASS [ ] FAIL |
| Full Workflow | Integration | [ ] PASS [ ] FAIL |

---

## 🐛 TROUBLESHOOTING

### Issue: Wake word not detected

**Solution**:

1. Check microphone is connected
2. Check microphone permissions granted
3. Try speaking louder/clearer
4. Check browser console for errors
5. Refresh page (Ctrl+R)

### Issue: Wrong variation logged

**Solution**:

1. Check speech recognition accuracy
2. Try speaking more clearly
3. Check console for actual transcript
4. Verify variation is in the list

### Issue: Command not executing

**Solution**:

1. Check Gemini API is working
2. Check browser console for errors
3. Verify command is clear
4. Check network connection

---

## 📝 CONSOLE LOGS REFERENCE

### Good Logs

```
🎤 Initializing wake word listener on mount
🎤 Starting wake word listener
🎤 Wake word listener started
🎤 Final transcript: hey laura
✅ Wake word detected: hey laura
🎤 Calling onWakeWordDetected callback
🎤 Wake word detected, activating command listening
```

### Bad Logs (Should NOT See)

```
🎤 Wake word recognition ended
🎤 Restarting wake word listener...
🎤 Wake word listener started
🎤 Starting wake word recognition again
🎤 Wake word recognition ended
[REPEATING INFINITELY]
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Application running on port 3002
- [ ] DevTools open (F12)
- [ ] Console tab visible
- [ ] Microphone connected
- [ ] Microphone permissions granted
- [ ] All 6 variations tested
- [ ] Negative test passed
- [ ] Full workflow tested
- [ ] No infinite loops
- [ ] No errors in console

---

## 🎯 SUCCESS CRITERIA

✅ **All 6 variations detected**  
✅ **Correct variation logged**  
✅ **Non-matching phrase ignored**  
✅ **Commands execute after wake word**  
✅ **No infinite loops**  
✅ **No errors in console**

---

## 📋 NOTES

- Speak clearly for best results
- Allow 1-2 seconds between phrases
- Check console for actual transcript if detection fails
- Refresh page if issues occur
- Check microphone permissions if no detection

---

## 🚀 NEXT STEPS

1. Complete all test scenarios
2. Document any issues
3. Report results
4. Deploy to production if all tests pass

---

**Ready to test phonetic variations!** 🎤✨
