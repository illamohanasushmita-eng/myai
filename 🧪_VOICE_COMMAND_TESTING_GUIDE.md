# 🧪 Voice Command Testing Guide

**Date**: 2025-11-07  
**Status**: Ready for Testing

---

## 🚀 Quick Start

### Prerequisites

1. ✅ Application running on http://localhost:3002
2. ✅ User logged in (userId stored in localStorage)
3. ✅ Microphone enabled and working
4. ✅ Browser supports Web Speech API (Chrome, Edge, Safari)

### Setup

1. Go to http://localhost:3002/dashboard
2. Look for the blue microphone button (bottom-right)
3. Open browser DevTools (F12) to see console logs

---

## 🎤 Test Cases

### Test 1: Wake Word Detection

**Command**: Say "Hey Lara"

**Expected**:

- Blue pulsing indicator changes to listening state
- Console shows: "✅ Wake word detected: hey lara"
- Feedback message: "Wake word detected! Listening for command..."
- Microphone button turns red (listening for command)

**Pass/Fail**: \_\_\_

---

### Test 2: Show Tasks Command

**Command**: Say "Hey Lara" → "Show my tasks"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening your tasks..."
- Navigate to /professional page
- Console shows intent: "show_tasks"

**Pass/Fail**: \_\_\_

---

### Test 3: Add Reminder Command

**Command**: Say "Hey Lara" → "Add a reminder"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening reminders..."
- Navigate to /reminders/add page
- Console shows intent: "add_reminder"

**Pass/Fail**: \_\_\_

---

### Test 4: Play Music Command

**Command**: Say "Hey Lara" → "Play a song"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "🎵 Searching for music..."
- Spotify search executes
- Feedback: "🎵 Music found! Playing now..."
- Console shows: "🎵 Playing music: favorite songs"

**Pass/Fail**: \_\_\_

---

### Test 5: Play Specific Artist

**Command**: Say "Hey Lara" → "Play prabhas songs"

**Expected**:

- Wake word detected
- Voice command recognized
- Spotify searches for "prabhas songs"
- Music plays
- Feedback: "🎵 Music found! Playing now..."

**Pass/Fail**: \_\_\_

---

### Test 6: Show Health Data

**Command**: Say "Hey Lara" → "Show my health data"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening your health data..."
- Navigate to /healthcare page
- Console shows intent: "show_health"

**Pass/Fail**: \_\_\_

---

### Test 7: Show Professional Section

**Command**: Say "Hey Lara" → "Show my work"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening your professional section..."
- Navigate to /professional page
- Console shows intent: "show_professional"

**Pass/Fail**: \_\_\_

---

### Test 8: Show Personal Growth

**Command**: Say "Hey Lara" → "Show my goals"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening your personal growth..."
- Navigate to /personal-growth page
- Console shows intent: "show_growth"

**Pass/Fail**: \_\_\_

---

### Test 9: Show Home Section

**Command**: Say "Hey Lara" → "Show my home tasks"

**Expected**:

- Wake word detected
- Voice command recognized
- Feedback: "Opening your home section..."
- Navigate to /at-home page
- Console shows intent: "show_home"

**Pass/Fail**: \_\_\_

---

### Test 10: Error Handling - No Microphone Permission

**Setup**: Deny microphone permission

**Expected**:

- Microphone button shows disabled state
- Tooltip: "Voice commands not supported in your browser"
- No errors in console

**Pass/Fail**: \_\_\_

---

## 📊 Console Logging

### Expected Console Output

**Wake Word Detection**:

```
✅ Wake word detected: hey lara
```

**Voice Command Processing**:

```
🎵 Playing music: favorite songs
```

**API Calls**:

```
POST /api/ai/voice-command
Response: { success: true, intent: { ... } }
```

**Spotify Search**:

```
GET /api/spotify/search?q=favorite%20songs&type=track
Response: { query: "favorite songs", results: [...] }
```

---

## 🐛 Troubleshooting

### Issue: Wake word not detected

**Solution**:

- Check microphone is working
- Speak clearly and loudly
- Check browser console for errors
- Verify browser supports Web Speech API

### Issue: Voice command not recognized after wake word

**Solution**:

- Wait for "Listening..." message
- Speak clearly
- Check console for "GEMINI_ERROR"
- Verify API endpoint is working

### Issue: Spotify music not playing

**Solution**:

- Check userId is in localStorage
- Verify Spotify credentials in .env
- Check console for Spotify API errors
- Ensure user has Spotify account

### Issue: Navigation not working

**Solution**:

- Check router is working
- Verify page paths are correct
- Check console for navigation errors
- Try manual navigation to verify pages exist

---

## ✅ Success Criteria

All tests should pass:

- [ ] Wake word detection works
- [ ] Voice commands recognized
- [ ] Music playback works
- [ ] Navigation works
- [ ] Error handling works
- [ ] User feedback displays
- [ ] Console shows proper logs
- [ ] No errors in browser console

---

## 📝 Notes

- Tests should be run in order
- Allow 2-3 seconds between commands
- Speak clearly and naturally
- Check console for detailed logs
- Report any failures with console output

---

**Ready to Test**: ✅ YES
