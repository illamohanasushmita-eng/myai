# 🔧 Lara Voice Assistant - Troubleshooting Guide

**Last Updated**: 2025-11-08

---

## 🚨 Critical Issues

### Issue 1: Application Won't Start

**Error**: `EADDRINUSE: address already in use :::3002`

**Solution**:

```bash
# Kill process on port 3002
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3003
```

---

### Issue 2: Hydration Mismatch Error

**Error**: "Hydration failed because the server rendered text didn't match the client"

**Solution**:

- ✅ Already fixed in `src/app/test-lara/page.tsx`
- Clear browser cache: `Ctrl+Shift+Delete`
- Hard refresh: `Ctrl+Shift+R`
- Check browser console for other errors

---

### Issue 3: Missing Environment Variables

**Error**: `OPENAI_API_KEY is not defined`

**Solution**:

1. Check `.env.local` file exists
2. Verify all required keys are present
3. Restart dev server: `npm run dev`

---

## 🎤 Voice Input Issues

### Issue: Microphone Not Working

**Symptoms**: No audio input, "Microphone access denied"

**Troubleshooting**:

1. Check microphone is connected
2. Check browser permissions
3. Verify microphone is not muted
4. Test with other apps

---

### Issue: "Hey Lara" Not Detected

**Symptoms**: Wake word listener doesn't respond

**Troubleshooting**:

1. Speak clearly and loudly
2. Check microphone is working
3. Look for errors in browser console (F12)
4. Verify Web Speech API is supported

---

## 🔊 Audio Output Issues

### Issue: No Sound Output

**Symptoms**: Lara doesn't speak

**Troubleshooting**:

1. Check speaker/headphones connected
2. Check volume is not muted
3. Test with browser console:
   ```javascript
   const utterance = new SpeechSynthesisUtterance("Hello");
   window.speechSynthesis.speak(utterance);
   ```

---

## 🧠 Intent Recognition Issues

### Issue: Intent Not Recognized

**Symptoms**: Lara doesn't understand commands

**Troubleshooting**:

1. Verify OpenAI API key in `.env.local`
2. Check API usage limits
3. Speak more clearly
4. Use exact command phrases

---

### Issue: Wrong Intent Detected

**Symptoms**: Lara understands but executes wrong action

**Troubleshooting**:

1. Reduce background noise
2. Use specific commands
3. Check system prompt in code
4. Verify intent definitions

---

## 🧭 Navigation Issues

### Issue: Navigation Not Working

**Symptoms**: Lara says "Opening page" but doesn't navigate

**Troubleshooting**:

1. Verify routes exist:
   - `/dashboard` - Home
   - `/professional` - Tasks
   - `/reminders` - Reminders
   - `/personal-growth` - Growth

2. Check browser console for errors
3. Verify Next.js routing is correct

---

## 🎵 Spotify Integration Issues

### Issue: Music Not Playing

**Symptoms**: Lara says "Now playing" but no music

**Troubleshooting**:

1. Verify Spotify account is active
2. Check Spotify API credentials
3. Verify Spotify app is running
4. Check API usage limits

---

## 🔄 Continuous Loop Issues

### Issue: Lara Stops Listening

**Symptoms**: Lara responds but doesn't loop back

**Troubleshooting**:

1. Check browser console for errors
2. Monitor memory usage
3. Verify loop implementation
4. Check for infinite loops

---

## 🛑 Stop/Restart Issues

### Issue: Stop Button Doesn't Work

**Symptoms**: Lara keeps listening after clicking Stop

**Troubleshooting**:

1. Check stop function is called
2. Verify state management
3. Check browser console

---

### Issue: Restart Button Doesn't Work

**Symptoms**: Restart doesn't restart Lara

**Troubleshooting**:

1. Click Stop first
2. Wait 1 second
3. Click Restart
4. Check console for errors

---

## 📊 Performance Issues

### Issue: Slow Response Time

**Symptoms**: Lara takes too long to respond

**Troubleshooting**:

1. Check internet connection
2. Check API response times
3. Monitor network latency
4. Check browser performance

---

### Issue: High Memory Usage

**Symptoms**: Browser becomes slow

**Troubleshooting**:

1. Check for memory leaks
2. Look for infinite loops
3. Clear browser cache
4. Restart browser

---

## ✅ Verification Checklist

Before reporting issues:

- [ ] Microphone is working
- [ ] Speaker is working
- [ ] Internet connection is stable
- [ ] All environment variables are set
- [ ] Browser is up to date
- [ ] Cache is cleared
- [ ] Page is hard refreshed
- [ ] No console errors
- [ ] API keys are valid

---

**Need help? Check the documentation files! 📚**
