# 🧪 Lara Voice Assistant - Testing Guide

**Status**: ✅ Ready for Testing  
**Date**: 2025-11-08  
**Build**: ✅ Successful

---

## 🚀 Quick Start Testing

### 1. Access the Test Page
```
http://localhost:3002/test-lara
```

### 2. Grant Permissions
- Browser will ask for microphone access
- Click "Allow" to grant permission
- Ensure speakers/headphones are working

### 3. Start Lara
- Click the **"Start"** button in the status panel
- Status should show: "Listening for 'Hey Lara'..."

---

## 🎤 Test Scenarios

### Test 1: Wake Word Detection
**Objective**: Verify Lara detects "Hey Lara"

**Steps**:
1. Click "Start" button
2. Say clearly: **"Hey Lara"**
3. Wait for response

**Expected Result**:
- ✅ Lara responds: "How can I help you?"
- ✅ Status changes to "Listening for command..."
- ✅ You hear the greeting

**If it fails**:
- Check microphone is working
- Speak louder and clearer
- Check browser permissions
- Verify speaker volume

---

### Test 2: Music Playback
**Objective**: Verify Spotify integration

**Steps**:
1. After "How can I help you?" prompt
2. Say: **"Play a song"**
3. Wait for action

**Expected Result**:
- ✅ Lara responds: "Now playing..."
- ✅ Music starts playing (if Spotify connected)
- ✅ Loops back to listening

**If it fails**:
- Verify Spotify account is connected
- Check Spotify API credentials
- Ensure Spotify is running
- Check OpenAI API key

---

### Test 3: Task Management
**Objective**: Verify task navigation

**Steps**:
1. After "How can I help you?" prompt
2. Say: **"Show my tasks"**
3. Wait for navigation

**Expected Result**:
- ✅ Lara responds: "Opening tasks page"
- ✅ Page navigates to `/professional`
- ✅ Loops back to listening

**If it fails**:
- Check router configuration
- Verify page exists at `/professional`
- Check browser console for errors

---

### Test 4: Reminder Management
**Objective**: Verify reminder navigation

**Steps**:
1. After "How can I help you?" prompt
2. Say: **"Show my reminders"**
3. Wait for navigation

**Expected Result**:
- ✅ Lara responds: "Opening reminders page"
- ✅ Page navigates to `/reminders`
- ✅ Loops back to listening

**If it fails**:
- Check router configuration
- Verify page exists at `/reminders`
- Check browser console for errors

---

### Test 5: Navigation
**Objective**: Verify page navigation

**Steps**:
1. After "How can I help you?" prompt
2. Say: **"Go to home page"**
3. Wait for navigation

**Expected Result**:
- ✅ Lara responds: "Opening home page"
- ✅ Page navigates to `/dashboard`
- ✅ Loops back to listening

**If it fails**:
- Check router configuration
- Verify page exists at `/dashboard`
- Check browser console for errors

---

### Test 6: Generic Query
**Objective**: Verify OpenAI fallback

**Steps**:
1. After "How can I help you?" prompt
2. Say: **"Tell me a joke"**
3. Wait for response

**Expected Result**:
- ✅ Lara responds with OpenAI-generated joke
- ✅ Loops back to listening

**If it fails**:
- Verify OpenAI API key is valid
- Check API usage limits
- Verify internet connection

---

### Test 7: Continuous Loop
**Objective**: Verify continuous listening

**Steps**:
1. Complete Test 1-6 in sequence
2. After each command, Lara should loop back
3. Test multiple commands in one session

**Expected Result**:
- ✅ Lara listens continuously
- ✅ No crashes or errors
- ✅ Smooth transitions between commands

**If it fails**:
- Check browser console for errors
- Verify memory usage
- Check for infinite loops

---

### Test 8: Error Handling
**Objective**: Verify error handling

**Steps**:
1. Click "Start" button
2. Say something unclear: **"Blah blah blah"**
3. Wait for response

**Expected Result**:
- ✅ Lara handles gracefully
- ✅ Loops back to listening
- ✅ No crashes

**If it fails**:
- Check error handling in code
- Verify fallback responses
- Check browser console

---

### Test 9: Stop Button
**Objective**: Verify stop functionality

**Steps**:
1. Click "Start" button
2. Say: **"Hey Lara"**
3. Wait for greeting
4. Click "Stop" button

**Expected Result**:
- ✅ Lara stops listening
- ✅ Status shows "Stopped"
- ✅ No more responses

**If it fails**:
- Check stop function implementation
- Verify state management
- Check browser console

---

### Test 10: Restart Button
**Objective**: Verify restart functionality

**Steps**:
1. Click "Start" button
2. Click "Stop" button
3. Click "Restart" button
4. Say: **"Hey Lara"**

**Expected Result**:
- ✅ Lara restarts successfully
- ✅ Responds to "Hey Lara"
- ✅ Works normally

**If it fails**:
- Check restart function
- Verify state cleanup
- Check browser console

---

## 🔍 Debugging Checklist

### Browser Console
- [ ] No JavaScript errors
- [ ] No hydration warnings
- [ ] No API errors
- [ ] Check network tab for API calls

### Microphone
- [ ] Microphone is connected
- [ ] Browser has permission
- [ ] Microphone is not muted
- [ ] Volume is adequate

### Speaker
- [ ] Speaker/headphones connected
- [ ] Volume is not muted
- [ ] Volume is adequate
- [ ] Audio is working

### API Keys
- [ ] OpenAI API key is valid
- [ ] Supabase keys are valid
- [ ] Spotify credentials are set
- [ ] All keys in `.env.local`

### Network
- [ ] Internet connection is stable
- [ ] No firewall blocking
- [ ] API endpoints are reachable
- [ ] No CORS errors

---

## 📊 Test Results Template

```
Test Date: ___________
Browser: ___________
OS: ___________

Test 1 - Wake Word: [ ] Pass [ ] Fail
Test 2 - Music: [ ] Pass [ ] Fail
Test 3 - Tasks: [ ] Pass [ ] Fail
Test 4 - Reminders: [ ] Pass [ ] Fail
Test 5 - Navigation: [ ] Pass [ ] Fail
Test 6 - Generic Query: [ ] Pass [ ] Fail
Test 7 - Continuous Loop: [ ] Pass [ ] Fail
Test 8 - Error Handling: [ ] Pass [ ] Fail
Test 9 - Stop Button: [ ] Pass [ ] Fail
Test 10 - Restart Button: [ ] Pass [ ] Fail

Overall Status: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🐛 Common Issues & Solutions

### Issue: "Microphone access denied"
**Solution**:
1. Check browser permissions
2. Go to Settings → Privacy → Microphone
3. Allow the app to use microphone
4. Reload page

### Issue: "No audio output"
**Solution**:
1. Check speaker volume
2. Check browser volume
3. Test with different browser
4. Verify audio device is connected

### Issue: "Intent not recognized"
**Solution**:
1. Speak more clearly
2. Use specific commands
3. Check OpenAI API key
4. Verify API usage limits

### Issue: "Navigation not working"
**Solution**:
1. Check router configuration
2. Verify page paths
3. Check browser console
4. Verify Next.js routing

### Issue: "Hydration error"
**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check console for errors
4. Verify component state

---

## ✅ Success Criteria

All tests pass when:
- ✅ Wake word detection works
- ✅ All intents are recognized
- ✅ Actions execute correctly
- ✅ Voice responses are clear
- ✅ Continuous loop works
- ✅ Error handling is graceful
- ✅ No crashes or errors
- ✅ Performance is smooth

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Check network tab for API calls
3. Verify all environment variables
4. Check microphone/speaker
5. Review error messages
6. Check documentation

---

**Ready to test Lara! 🎤✨**

