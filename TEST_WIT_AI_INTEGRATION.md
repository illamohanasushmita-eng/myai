# 🧪 Testing Wit.ai Integration with Fallback

## Quick Start Testing

### Test 1: Fallback Pattern Matching (Works Now!)

1. **Open the app**: http://localhost:3002
2. **Click the microphone button** on the dashboard
3. **Say**: "show my tasks"
4. **Expected Result**:
   - Lara says: "How can I help you?"
   - You say: "show my tasks"
   - Lara says: "Opening tasks page"
   - You're navigated to the tasks page

5. **Check Console** (F12 → Console):
   ```
   🧠 Processing intent for text: show my tasks
   ⚠️ No intents found in Wit.ai response, using fallback pattern matching
   ✅ Fallback intent detected: show_tasks (confidence: 0.7)
   🎯 Routing intent: show_tasks
   📋 Opening tasks page
   ```

### Test 2: Play Music Command

1. **Click microphone button**
2. **Say**: "play a song"
3. **Expected Result**:
   - Lara says: "How can I help you?"
   - You say: "play a song"
   - Lara says: "Please specify a song name"

4. **Try again with song name**:
   - Say: "play Arijit Singh songs"
   - Lara should play the song

### Test 3: Add Task Command

1. **Click microphone button**
2. **Say**: "add a task buy groceries"
3. **Expected Result**:
   - Lara says: "How can I help you?"
   - You say: "add a task buy groceries"
   - Lara says: "Opening add task page"
   - You're navigated to add task page

### Test 4: Reminders Command

1. **Click microphone button**
2. **Say**: "show my reminders"
3. **Expected Result**:
   - Lara navigates to reminders page

## Supported Fallback Commands

### Music Commands

```
"play a song"
"play [song name]"
"play Arijit Singh songs"
"play telugu songs"
"music [song name]"
```

### Task Commands

```
"show my tasks"
"what are my tasks"
"list my tasks"
"add a task [task name]"
"create a task [task name]"
"add buy groceries to my tasks"
```

### Reminder Commands

```
"show my reminders"
"what are my reminders"
"remind me to [action] at [time]"
"add a reminder [reminder text]"
"remind me to drink water at 5pm"
```

### Navigation Commands

```
"go to professional page"
"open personal growth page"
"navigate to reminders"
"show tasks page"
```

## Debugging

### Check Server Logs

Open terminal where dev server is running and look for:

```
🧠 Processing intent for text: [your command]
📡 Wit.ai response status: 200
✅ Wit.ai full response: { intents: [], entities: {}, ... }
⚠️ No intents found in Wit.ai response, using fallback pattern matching
✅ Fallback intent detected: [intent_name] (confidence: 0.7)
🎯 Routing intent: [intent_name]
```

### Check Browser Console

Open DevTools (F12) and check:

1. Network tab → Look for `/api/intent` requests
2. Console tab → Look for logs from lara-assistant.ts

### Test API Directly

```bash
curl -X POST http://localhost:3002/api/intent \
  -H "Content-Type: application/json" \
  -d '{"text":"show my tasks"}'
```

Expected response:

```json
{
  "intent": "show_tasks",
  "confidence": 0.7,
  "entities": {},
  "raw": { "fallback": true }
}
```

## Microphone Button Testing

### Test: Stop on Second Click

1. **Click microphone button** (starts listening)
   - Button should show active state
   - Console: "🎤 Starting Lara"

2. **Click again immediately** (stops listening)
   - Button should show inactive state
   - Console: "🎤 Stopping Lara"

3. **Expected**: Button toggles properly, no errors

## Troubleshooting

### Problem: Intent returns null

**Check**:

1. Is the text being sent to the API?
2. Are the regex patterns matching?
3. Check console for "Fallback intent detected"

**Solution**:

- Try exact phrases from the supported commands list
- Check regex patterns in `src/lib/lara/witai-fallback.ts`

### Problem: Wrong intent detected

**Check**:

1. Which intent was detected?
2. Does it match the command?

**Solution**:

- Update regex patterns in `witai-fallback.ts`
- Or train Wit.ai with more utterances

### Problem: Microphone not working

**Check**:

1. Browser console for errors
2. Microphone permissions
3. Network tab for API errors

**Solution**:

- Allow microphone access
- Check browser console for specific errors
- Restart dev server

## Next: Train Wit.ai for Better Accuracy

Once fallback is working, train Wit.ai:

1. Go to https://wit.ai
2. Open your app
3. For each intent, add utterances:
   - `tasks_show`: "show my tasks", "what are my tasks", "list tasks"
   - `music_play`: "play a song", "play music", "play [song name]"
   - `reminder_create`: "remind me", "add reminder", "set reminder"
   - etc.
4. Click Train/Validate
5. Wit.ai will now recognize these with higher confidence

## Success Criteria

✅ Microphone button works
✅ Wake word "Hey Lara" detected
✅ Commands recognized (using fallback)
✅ Correct intents routed
✅ Actions executed (navigate, play music, etc.)
✅ Lara speaks confirmations
✅ Button stops on second click
✅ No console errors

## Performance Notes

- **Fallback pattern matching**: ~1-5ms (instant)
- **Wit.ai API call**: ~500-2000ms (depends on network)
- **Total flow**: ~2-3 seconds (wake word + command + processing)

## Next Steps

1. ✅ Test fallback commands (do this first)
2. ✅ Verify microphone button works
3. ⏭️ Train Wit.ai for better accuracy
4. ⏭️ Add more custom patterns if needed
