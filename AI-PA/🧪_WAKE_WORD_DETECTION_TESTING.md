# 🧪 Wake Word Detection - Testing Guide

**Status**: ✅ Ready for Testing  
**Date**: 2025-11-09  

---

## ✅ Pre-Testing Checklist

- [ ] Application running on http://localhost:3002
- [ ] Microphone enabled in browser
- [ ] Speaker/headphones connected
- [ ] Internet connection active
- [ ] Browser console open (F12)
- [ ] User logged in

---

## 🧪 Test Cases

### Test 1: Wake Word Required
**Objective**: Verify Lara ignores speech without "Hey Lara"

**Steps**:
1. Click microphone button
2. Wait for "Listening for wake word..." message
3. Say "hello world" (without "Hey Lara")
4. Wait 5 seconds
5. Observe behavior

**Expected Result**:
- ✅ Lara continues listening
- ✅ No greeting spoken
- ✅ No command processing
- ✅ Console shows: "🎤 Detected speech: hello world"
- ✅ Console shows: "👂 Restarting wake word listener..."

**Actual Result**: _______________

---

### Test 2: Wake Word Detection
**Objective**: Verify "Hey Lara" is detected correctly

**Steps**:
1. Click microphone button
2. Wait for "Listening for wake word..." message
3. Say "Hey Lara" clearly
4. Observe response

**Expected Result**:
- ✅ Console shows: "🎤 Detected speech: hey lara"
- ✅ Console shows: "🎤 Wake word detected!"
- ✅ Lara speaks greeting: "How can I help you?"
- ✅ Greeting uses female voice (higher pitch)
- ✅ Console shows: "👂 Listening for command..."

**Actual Result**: _______________

---

### Test 3: Command Processing After Wake Word
**Objective**: Verify commands are processed after wake word

**Steps**:
1. Complete Test 2 (say "Hey Lara")
2. After greeting, say "play a song"
3. Observe action

**Expected Result**:
- ✅ Console shows: "📝 Command received: play a song"
- ✅ Console shows: "🧠 Parsing intent..."
- ✅ Console shows: "✅ Intent parsed: PLAY_SONG"
- ✅ Music starts playing (if Spotify connected)
- ✅ Lara speaks confirmation
- ✅ Loop continues listening for next wake word

**Actual Result**: _______________

---

### Test 4: Multiple Wake Words
**Objective**: Verify loop continues after command

**Steps**:
1. Complete Test 3 (play a song)
2. After confirmation, say "Hey Lara" again
3. Say another command

**Expected Result**:
- ✅ Lara detects second "Hey Lara"
- ✅ Lara speaks greeting again
- ✅ Second command is processed
- ✅ Loop continues indefinitely

**Actual Result**: _______________

---

### Test 5: Female Voice Verification
**Objective**: Verify greeting uses female voice

**Steps**:
1. Click microphone button
2. Say "Hey Lara"
3. Listen to greeting carefully

**Expected Result**:
- ✅ Greeting sounds like female voice
- ✅ Higher pitch than normal male voice
- ✅ Clear and natural sounding

**Actual Result**: _______________

---

### Test 6: Timeout Handling
**Objective**: Verify 30-second timeout for wake word

**Steps**:
1. Click microphone button
2. Wait 30 seconds without speaking
3. Observe behavior

**Expected Result**:
- ✅ After 30 seconds, listening stops
- ✅ Console shows timeout error
- ✅ Button returns to normal state
- ✅ Can click again to restart

**Actual Result**: _______________

---

### Test 7: Error Handling - No Microphone
**Objective**: Verify error when microphone unavailable

**Steps**:
1. Disable microphone in browser settings
2. Click microphone button
3. Observe error handling

**Expected Result**:
- ✅ Error message displayed
- ✅ Console shows microphone error
- ✅ Button returns to normal state
- ✅ Can enable microphone and retry

**Actual Result**: _______________

---

### Test 8: Stop Button
**Objective**: Verify stop button works

**Steps**:
1. Click microphone button
2. Say "Hey Lara"
3. While listening for command, click button again
4. Observe behavior

**Expected Result**:
- ✅ Button turns gray
- ✅ Listening stops
- ✅ Console shows: "🎤 Stopping Lara"
- ✅ Console shows: "🛑 Lara Assistant stopped"

**Actual Result**: _______________

---

### Test 9: Partial Wake Word
**Objective**: Verify partial matches don't trigger

**Steps**:
1. Click microphone button
2. Say "Hey" (without "Lara")
3. Wait 5 seconds
4. Say "Lara" (without "Hey")
5. Wait 5 seconds

**Expected Result**:
- ✅ Neither triggers wake word detection
- ✅ Lara continues listening
- ✅ No greeting spoken

**Actual Result**: _______________

---

### Test 10: Case Insensitivity
**Objective**: Verify wake word works in any case

**Steps**:
1. Click microphone button
2. Say "HEY LARA" (all caps)
3. Observe response

**Expected Result**:
- ✅ Wake word detected
- ✅ Greeting spoken
- ✅ Works regardless of case

**Actual Result**: _______________

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Wake Word Required | [ ] | |
| 2. Wake Word Detection | [ ] | |
| 3. Command Processing | [ ] | |
| 4. Multiple Wake Words | [ ] | |
| 5. Female Voice | [ ] | |
| 6. Timeout Handling | [ ] | |
| 7. Error Handling | [ ] | |
| 8. Stop Button | [ ] | |
| 9. Partial Wake Word | [ ] | |
| 10. Case Insensitivity | [ ] | |

---

## 🔍 Console Verification

### Expected Console Logs

**Starting**:
```
🎤 VoiceCommandButton mounted, auto-starting Lara
🎤 Lara Assistant started
👂 Listening for wake word "Hey Lara"...
```

**Saying Random Words**:
```
🎤 Detected speech: hello world
👂 Restarting wake word listener...
👂 Listening for wake word "Hey Lara"...
```

**Saying "Hey Lara"**:
```
🎤 Detected speech: hey lara
🎤 Wake word detected!
🗣️ Speaking greeting...
👂 Listening for command...
```

**Saying Command**:
```
📝 Command received: play a song
🧠 Parsing intent...
✅ Intent parsed: PLAY_SONG
⚙️ Handling intent...
🗣️ Speaking confirmation...
✅ Command completed
👂 Listening for wake word "Hey Lara"...
```

---

## ✅ Final Verification

- [ ] All 10 tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Wake word required before commands
- [ ] Female voice used for greeting
- [ ] Proper error handling
- [ ] Timeout working
- [ ] Loop continues indefinitely

---

## 🎉 Sign-Off

**Tested By**: _______________  
**Date**: _______________  
**Status**: _______________  

---

**Ready for production! 🚀**

